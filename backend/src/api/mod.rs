pub mod models;
pub mod routes;

use axum::routing::{get, post};
use axum::Router;

use crate::AppState;

pub fn get_router(state: &AppState) -> Router {
    Router::new()
        .route("/apply", post(routes::apply_rule))
        .route("/exercise", get(routes::get_exercises))
        .route("/exercise/{id}", get(routes::get_exercise))
        .route("/exercise", post(routes::create_exercise))
        .route("/parse", post(routes::parse))
        .route("/rules", get(routes::all_rules))
        .route("/check", post(routes::check))
        .route("/add_tree", post(routes::add_tree))
        .route("/exercise/{id}/feedback", post(routes::post_feedback))
        // .route("/tree", post(routes::add_tree))
        .with_state(state.clone())
}
