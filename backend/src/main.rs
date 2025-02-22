pub mod api;
mod db;
mod docs;
mod utils;
// mod entities;
mod error;
mod lib;
// mod search_engine;
// mod utils;

use crate::docs::ApiDocs;
use axum::extract::Request;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{http, Router};
use http::Method;
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
    let db = connect_db().await.unwrap();

    let origins = [
        "http://localhost:3000".parse().unwrap(),
        // "http://nethmap.course-fwe-2023.isginf.ch".parse().unwrap(),
        // "https://nethmap.course-fwe-2023.isginf.ch".parse().unwrap(),
    ];

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

    let app = Router::new()
        .merge(SwaggerUi::new("/api/docs").url("/api/docs/openapi.json", ApiDocs::openapi()))
        .nest("/api", api::get_router(&app_state))
        .fallback(handler_404)
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
