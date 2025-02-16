use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use super::formula_models::Identifier;

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema, PartialEq, PartialOrd)]
pub enum Rules {
    Ax,
    ImplIntro,
    ImplElim,
    FalseElim,
    NotIntro,
    NotElim,
    AndIntro,
    AndElimL,
    AndElimR,
    OrIntroL,
    OrIntroR,
    OrElim,
    ForallElim,
    ForallIntro,
    ExistsElim,
    ExistsIntro,
    AlphaExists,
    AlphaForall,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, PartialOrd, PartialEq, Ord, Eq)]
pub enum RuleIdentifier {
    Formula(u32),
    Element(String),
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub enum RuleFormula {
    Ident(RuleIdentifier),
    And(RuleIdentifier, RuleIdentifier),
    Or(RuleIdentifier, RuleIdentifier),
    Not(RuleIdentifier),
    Imp(RuleIdentifier, RuleIdentifier),
    False,
    True,
    Forall(RuleIdentifier, Box<RuleFormula>),
    Exists(RuleIdentifier, Box<RuleFormula>),
    Substitution(RuleIdentifier, RuleIdentifier, RuleIdentifier),
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct RuleStatement {
    pub lhs: Option<RuleIdentifier>,
    pub formula: RuleFormula,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct DerivationRule {
    pub name: Rules,
    pub premises: Vec<RuleStatement>,
    pub conclusion: RuleStatement,
}
