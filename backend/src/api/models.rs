use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use super::{
    formula_models::{Formula, Statement},
    rule_models::Rules,
};

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct FormulaMapping {
    pub from: u32,
    pub to: Formula,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct ElementMapping {
    pub from: String,
    pub to: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct ApplyRuleParams {
    pub statement: Statement,
    pub rule: Rules,
    pub mapping: Vec<FormulaMapping>,
    pub substitution: Vec<ElementMapping>,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct Feedback {
    pub like: bool,
    pub difficulty: Option<u32>,
}
