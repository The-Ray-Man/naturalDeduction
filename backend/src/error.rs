use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum BackendError {
    #[error("DB error: {0}")]
    DBError(#[from] sea_orm::DbErr),

    #[error("No {entity} found")]
    NotFound { entity: String },

    #[error("No {entity} with id {id} found")]
    IdNotFound { entity: String, id: String },

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Unknown error: {0}")]
    Unknown(String),
}

impl BackendError {
    pub fn status_code(&self) -> StatusCode {
        match self {
            BackendError::DBError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            BackendError::NotFound { .. } => StatusCode::NOT_FOUND,
            BackendError::IdNotFound { .. } => StatusCode::NOT_FOUND,
            BackendError::BadRequest(_) => StatusCode::BAD_REQUEST,
            BackendError::Unknown(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    pub fn status_text(&self) -> String {
        match self {
            BackendError::DBError(_) => "Internal server error".to_string(),
            BackendError::NotFound { .. } => self.to_string(),
            BackendError::IdNotFound { .. } => self.to_string(),
            BackendError::BadRequest(_) => self.to_string(),
            BackendError::Unknown(_) => "Internal server error".to_string(),
        }
    }
}

impl IntoResponse for BackendError {
    fn into_response(self) -> Response {
        eprintln!("Error: {}", &self);
        (self.status_code(), self.status_text()).into_response()
    }
}

pub type BackendResult<T> = Result<T, BackendError>;
