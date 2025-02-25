use std::fmt::Display;

use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema, PartialEq, Eq, PartialOrd, Ord)]
#[serde(tag = "type", content = "value")]
pub enum Identifier {
    Literal(String),
    Element(String),
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema, PartialEq, Eq, PartialOrd, Ord)]
#[serde(tag = "type", content = "body")]
#[schema(no_recursion)]
pub enum Formula {
    And {
        lhs: Box<Formula>,
        rhs: Box<Formula>,
    },
    Or {
        lhs: Box<Formula>,
        rhs: Box<Formula>,
    },
    Not(Box<Formula>),
    Ident(Identifier),
    Imp {
        lhs: Box<Formula>,
        rhs: Box<Formula>,
    },
    True,
    False,
    Forall {
        identifier: Identifier,
        formula: Box<Formula>,
    },
    Exists {
        identifier: Identifier,
        formula: Box<Formula>,
    },
    Predicate {
        identifier: Identifier,
        identifiers: Vec<Identifier>,
    },
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct Statement {
    pub lhs: Vec<Formula>,
    pub formula: Formula,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams)]
pub struct ParseParams {
    pub formula: String,
}

impl Display for Identifier {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            match self {
                Identifier::Literal(s) => s,
                Identifier::Element(s) => s,
            }
        )
    }
}

impl Display for Formula {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Formula::And { lhs, rhs } => write!(f, "({lhs} and {rhs})"),
            Formula::Or { lhs, rhs } => write!(f, "({lhs} or {rhs})"),
            Formula::Not(formula) => write!(f, "(not {formula})"),
            Formula::Ident(identifier) => match identifier {
                Identifier::Literal(s) => write!(f, "{s}"),
                Identifier::Element(s) => write!(f, "{s}"),
            },
            Formula::Imp { lhs, rhs } => write!(f, "({lhs} -> {rhs})"),
            Formula::True => write!(f, "true"),
            Formula::False => write!(f, "false"),
            Formula::Forall {
                identifier,
                formula,
            } => write!(f, "(forall_{identifier} {formula})"),
            Formula::Exists {
                identifier,
                formula,
            } => write!(f, "(exists_{identifier} {formula})"),
            Formula::Predicate {
                identifier,
                identifiers,
            } => {
                let mut s = identifier.to_string();
                s.push('(');
                for i in identifiers {
                    s.push_str(&i.to_string());
                    s.push(',');
                }
                s.pop();
                s.push(')');
                write!(f, "{s}")
            }
        }
    }
}
