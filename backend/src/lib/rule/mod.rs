pub mod rule_definition;

use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

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
#[serde(tag = "type", content = "value")]
pub enum RuleIdentifier {
    Formula(u32),
    Element(String),
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
#[schema(no_recursion)]
#[serde(tag = "type", content = "body")]
pub enum RuleFormula {
    Ident(RuleIdentifier),
    And {
        lhs: RuleIdentifier,
        rhs: RuleIdentifier,
    },
    Or {
        lhs: RuleIdentifier,
        rhs: RuleIdentifier,
    },
    Not(RuleIdentifier),
    Imp {
        lhs: RuleIdentifier,
        rhs: RuleIdentifier,
    },
    False,
    True,
    Forall {
        identifier: RuleIdentifier,
        formula: Box<RuleFormula>,
    },
    Exists {
        identifier: RuleIdentifier,
        formula: Box<RuleFormula>,
    },
    Substitution {
        identifier: RuleIdentifier,
        lhs: RuleIdentifier,
        rhs: RuleIdentifier,
    },
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
