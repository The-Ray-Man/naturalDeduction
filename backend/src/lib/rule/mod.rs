pub mod apply;
pub mod rule_definition;
use std::collections::BTreeSet;

use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use super::derivation::formula::Identifier;

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

impl RuleFormula {
    pub fn identifiers(&self) -> BTreeSet<RuleIdentifier> {
        let mut ident = BTreeSet::new();
        match self {
            RuleFormula::Ident(rule_identifier) | RuleFormula::Not(rule_identifier) => {
                ident.insert(rule_identifier.clone());
            }
            RuleFormula::And { lhs, rhs }
            | RuleFormula::Or { lhs, rhs }
            | RuleFormula::Imp { lhs, rhs } => {
                ident.insert(lhs.clone());
                ident.insert(rhs.clone());
            }
            RuleFormula::True | RuleFormula::False => {}
            RuleFormula::Forall {
                identifier,
                formula,
            } => {
                ident.insert(identifier.clone());
                ident.extend(formula.identifiers());
            }
            RuleFormula::Exists {
                identifier,
                formula,
            } => {
                ident.insert(identifier.clone());
                ident.extend(formula.identifiers());
            }
            RuleFormula::Substitution {
                identifier,
                lhs,
                rhs,
            } => {
                ident.insert(identifier.clone());
                ident.insert(lhs.clone());
                ident.insert(rhs.clone());
            }
        }
        ident
    }
}

impl RuleStatement {
    pub fn identifiers(&self) -> BTreeSet<RuleIdentifier> {
        let mut set = BTreeSet::new();
        if let Some(lhs) = &self.lhs {
            set.insert(lhs.clone());
        }
        set.extend(self.formula.identifiers());
        set
    }
}

impl DerivationRule {
    pub fn identifiers(&self) -> BTreeSet<RuleIdentifier> {
        let mut set = self
            .premises
            .iter()
            .fold(BTreeSet::new(), |mut acc, premise| {
                acc.extend(premise.identifiers());
                acc
            });
        set.extend(self.conclusion.identifiers());
        set
    }
}
