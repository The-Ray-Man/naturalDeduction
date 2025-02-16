use serde::{Deserialize, Serialize};
use serde_json::Map;
use utoipa::{IntoParams, ToSchema};

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema, PartialEq, Eq, PartialOrd, Ord)]
pub enum Identifier {
    Literal(String),
    Element(String),
}

#[derive(Debug, Clone, Serialize, Deserialize, ToSchema, PartialEq, Eq, PartialOrd, Ord)]
pub enum Formula {
    And(Box<Formula>, Box<Formula>),
    Or(Box<Formula>, Box<Formula>),
    Not(Box<Formula>),
    Ident(Identifier),
    Imp(Box<Formula>, Box<Formula>),
    True,
    False,
    Forall(Identifier, Box<Formula>),
    Exists(Identifier, Box<Formula>),
    Predicate(Identifier, Vec<Identifier>),
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

impl ToString for Identifier {
    fn to_string(&self) -> String {
        match self {
            Identifier::Literal(s) => s.clone(),
            Identifier::Element(s) => s.clone(),
        }
    }
}

impl ToString for Formula {
    fn to_string(&self) -> String {
        match self {
            Formula::And(formula, formula1) => {
                format!("({} and {})", formula.to_string(), formula1.to_string())
            }
            Formula::Or(formula, formula1) => {
                format!("({} or {})", formula.to_string(), formula1.to_string())
            }
            Formula::Not(formula) => format!("(not {})", formula.to_string()),
            Formula::Ident(identifier) => match identifier {
                Identifier::Literal(s) => s.clone(),
                Identifier::Element(s) => s.clone(),
            },
            Formula::Imp(formula, formula1) => {
                format!("({} -> {})", formula.to_string(), formula1.to_string())
            }
            Formula::True => "true".to_string(),
            Formula::False => "false".to_string(),
            Formula::Forall(identifier, formula) => format!(
                "(forall_{} {})",
                identifier.to_string(),
                formula.to_string()
            ),
            Formula::Exists(identifier, formula) => format!(
                "(exists_{} {})",
                identifier.to_string(),
                formula.to_string()
            ),
            Formula::Predicate(identifier, identifiers) => {
                let mut s = identifier.to_string();
                s.push_str("(");
                for i in identifiers {
                    s.push_str(&i.to_string());
                    s.push_str(",");
                }
                s.pop();
                s.push_str(")");
                s
            }
        }
    }
}
