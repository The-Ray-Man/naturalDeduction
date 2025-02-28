pub mod api;
mod db;
mod docs;
mod lib;
mod logging;
mod utils;
// mod entities;
mod error;
// mod search_engine;
// mod utils;
use crate::docs::ApiDocs;
use axum::extract::Request;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{http, middleware, Router};
use http::Method;
use log::{error, info};
use logging::mw_map_response;
use sea_orm::DatabaseConnection;
use tower_http::cors::{Any, CorsLayer};
use utils::connect_db;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseConnection,
}

async fn handler_404(request: Request) -> impl IntoResponse {
    (
        StatusCode::NOT_FOUND,
        format!("404 Not Found: {}", request.uri().path()),
    )
}

#[tokio::main]
async fn main() {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let db = match connect_db().await {
        Ok(con) => con,
        Err(err) => return error!("unable to connect to database: {err}"),
    };

    let origins = ["http://localhost:3000".parse().unwrap()];

    let app_state = AppState { db };

    let cors = CorsLayer::new()
        .allow_methods([
            Method::OPTIONS,
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::HEAD,
            Method::TRACE,
            Method::CONNECT,
            Method::PATCH,
        ])
        .allow_origin(origins)
        .allow_headers(Any);
    // .allow_credentials(true);

    let mut app = Router::new()
        .merge(SwaggerUi::new("/api/docs").url("/api/docs/openapi.json", ApiDocs::openapi()))
        .nest("/api", api::get_router(&app_state))
        .layer(middleware::map_response(mw_map_response))
        .fallback(handler_404);

    #[cfg(feature = "static")]
    {
        use axum::routing::get;
        info!("enabled static frontend");
        app = app.fallback(get(files::static_file_handler));
    }

    app = app.layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    info!("starting web server at port 8000");
    axum::serve(listener, app).await.unwrap();
}

#[cfg(feature = "static")]
mod files {
    use axum::body::Body;
    use axum::http::{Request, Response, StatusCode, Uri};
    use tower::ServiceExt;

    pub async fn static_file_handler(uri: Uri) -> Result<Response<Body>, (StatusCode, String)> {
        match get_static_file(uri.clone()).await {
            Ok(res) => Ok(res),
            Err((status, msg)) => {
                if status == StatusCode::NOT_FOUND {
                    match format!("{}.html", uri).parse() {
                        Ok(uri_html) => get_static_file(uri_html).await,
                        Err(_) => {
                            Err((StatusCode::INTERNAL_SERVER_ERROR, "Invalid URI".to_string()))
                        }
                    }
                } else {
                    Err((status, msg))
                }
            }
        }
    }

    async fn get_static_file(uri: Uri) -> Result<Response<Body>, (StatusCode, String)> {
        let req = Request::builder().uri(uri).body(Body::empty()).unwrap();
        let uri = req.uri().clone();
        match tower_http::services::ServeDir::new("static")
            .oneshot(req)
            .await
        {
            Ok(res) => {
                if res.status().is_success() {
                    Ok(res.map(Body::new))
                } else {
                    Err((res.status(), format!("{}: {}", res.status(), uri.path())))
                }
            }
            Err(err) => Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Something went wrong: {}", err),
            )),
        }
    }
}
