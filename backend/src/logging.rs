use crate::error::BackendError;
use axum::body::Bytes;
use axum::http::{Method, Uri};
use axum::{
    extract::{Path, Request},
    http::{Response, StatusCode},
    middleware::Next,
    response::IntoResponse,
};
use std::collections::HashMap;
use std::sync::Arc;
use tracing::info;

pub async fn mw_map_response<B>(uri: Uri, req_method: Method, res: Response<B>) -> Response<B> {
    let api_error = res.extensions().get::<Arc<BackendError>>();

    info!(
        error = ?api_error,
        status = %res.status(),
        method = ?req_method,
        uri = ?uri,
        "Request"
    );

    res
}
