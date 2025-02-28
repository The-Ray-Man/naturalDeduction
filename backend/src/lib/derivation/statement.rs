use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use super::formula::Formula;

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct Statement {
    pub lhs: Vec<Formula>,
    pub formula: Formula,
}
