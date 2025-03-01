use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use utoipa::IntoParams;

use crate::lib::derivation::{formula::Formula, statement::Statement};
use crate::lib::rule::Rules;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema, PartialEq, Eq, PartialOrd, Ord)]
pub struct CreateExerciseRequest {
    pub lhs: Vec<Formula>,
    pub rhs: Formula,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct Exercise {
    pub id: Uuid,
    pub exercise: Statement,
    pub likes: i32,
    pub dislikes: i32,
    pub difficulty: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct Node {
    pub name: Uuid,
    pub statement: Statement,
    pub rule: Rules,
    pub premisses: Vec<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema)]
pub struct CreateTreeRequest {
    pub nodes: Vec<Node>,
    pub root_id: Uuid,
}

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

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct ParseParams {
    pub formula: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct Tipp {
    pub rule: Rules,
    pub premisses: Vec<Statement>,
}
