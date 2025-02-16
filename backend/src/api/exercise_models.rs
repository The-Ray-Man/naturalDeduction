use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use uuid::Uuid;

use super::{formula_models::{Formula, Statement}, rule_models::Rules};

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
    pub nodes : Vec<Node>,
    pub root_id: Uuid,
}