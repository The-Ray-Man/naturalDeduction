use std::{collections::BTreeSet, fmt::Display};

use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use crate::{
    api::models::SideCondition,
    error::{BackendError, BackendResult},
};

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

impl Formula {
    pub fn apply_substitution(
        &self,
        from: &String,
        to: &String,
        captured: BTreeSet<String>,
    ) -> BackendResult<Formula> {
        match self {
            Formula::And { lhs, rhs } => Ok(Formula::And {
                lhs: Box::new(lhs.apply_substitution(from, to, captured.clone())?),
                rhs: Box::new(rhs.apply_substitution(from, to, captured.clone())?),
            }),
            Formula::Or { lhs, rhs } => Ok(Formula::Or {
                lhs: Box::new(lhs.apply_substitution(from, to, captured.clone())?),
                rhs: Box::new(rhs.apply_substitution(from, to, captured.clone())?),
            }),
            Formula::Not(formula) => Ok(Formula::Not(Box::new(
                formula.apply_substitution(from, to, captured)?,
            ))),
            Formula::Ident(identifier) => {
                let new_name = match identifier.clone() {
                    Identifier::Element(s) | Identifier::Literal(s) => {
                        if s == *from {
                            if captured.contains(to) {
                                return Err(BackendError::BadRequest(
                                    "Substitution results in Capture of variable".to_string(),
                                ));
                            }
                            to.to_string()
                        } else {
                            s
                        }
                    }
                };
                match identifier {
                    Identifier::Element(_) => Ok(Formula::Ident(Identifier::Element(new_name))),
                    Identifier::Literal(_) => Ok(Formula::Ident(Identifier::Literal(new_name))),
                }
            }
            Formula::Imp { lhs, rhs } => Ok(Formula::Imp {
                lhs: Box::new(lhs.apply_substitution(from, to, captured.clone())?),
                rhs: Box::new(rhs.apply_substitution(from, to, captured.clone())?),
            }),
            Formula::True => Ok(Formula::True),
            Formula::False => Ok(Formula::False),
            Formula::Forall {
                identifier,
                formula,
            } => {
                let name = match &identifier {
                    Identifier::Element(s) | Identifier::Literal(s) => s,
                };
                let mut new_capture = captured.clone();
                new_capture.insert(name.clone());
                Ok(Formula::Forall {
                    identifier: identifier.clone(),
                    formula: Box::new(formula.apply_substitution(from, to, new_capture)?),
                })
            }
            Formula::Exists {
                identifier,
                formula,
            } => {
                let name = match &identifier {
                    Identifier::Element(s) => s,
                    Identifier::Literal(_) => Err(BackendError::BadRequest(
                        "The variable must be an simple element i.e. Not a formula.".to_string(),
                    ))?,
                };
                let mut new_capture = captured.clone();
                new_capture.insert(name.clone());
                Ok(Formula::Exists {
                    identifier: identifier.clone(),
                    formula: Box::new(formula.apply_substitution(from, to, new_capture)?),
                })
            }
            Formula::Predicate {
                identifier,
                identifiers,
            } => {
                let new_identifiers = identifiers
                    .into_iter()
                    .map(|i| match i {
                        Identifier::Element(s) | Identifier::Literal(s) => {
                            if s == from {
                                if captured.contains(to) {
                                    return Err(BackendError::BadRequest(
                                        "Substitution results in Capture of variable".to_string(),
                                    ));
                                }
                                Ok(Identifier::Element(to.to_string()))
                            } else {
                                Ok(Identifier::Element(s.to_string()))
                            }
                        }
                    })
                    .collect::<Result<Vec<Identifier>, BackendError>>()?;
                Ok(Formula::Predicate {
                    identifier: identifier.clone(),
                    identifiers: new_identifiers,
                })
            }
        }
    }

    pub fn can_contain_any_free_variable(&self) -> BackendResult<bool> {
        match self {
            Formula::And { lhs, rhs } | Formula::Or { lhs, rhs } | Formula::Imp { lhs, rhs } => {
                Ok(lhs.can_contain_any_free_variable()? || rhs.can_contain_any_free_variable()?)
            }
            Formula::Ident(identifier) => Ok(true),
            Formula::False | Formula::True => Ok(false),
            Formula::Not(formula) => formula.can_contain_any_free_variable(),
            Formula::Exists {
                identifier,
                formula,
            }
            | Formula::Forall {
                identifier,
                formula,
            } => formula.can_contain_any_free_variable(),
            Formula::Predicate {
                identifier,
                identifiers,
            } => Ok(false),
        }
    }

    pub fn captures(&self, side_con: &Vec<SideCondition>) -> BackendResult<BTreeSet<String>> {
        match self {
            Formula::And { lhs, rhs } | Formula::Imp { lhs, rhs } | Formula::Or { lhs, rhs } => {
                let lhs = lhs.captures(side_con)?;
                let rhs = rhs.captures(side_con)?;
                let res = lhs.intersection(&rhs).cloned().collect::<BTreeSet<_>>();
                Ok(res)
            }
            Formula::True
            | Formula::False
            | Formula::Predicate {
                identifier: _,
                identifiers: _,
            } => Ok(BTreeSet::new()),
            Formula::Ident(n) => {
                let captrue_from_sc = side_con
                    .iter()
                    .filter_map(|sc| {
                        match sc {
                            SideCondition::NotFree(pair) => {
                                if pair.placeholder == *n {
                                    match &pair.element {
                                        Identifier::Element(s) => return Some(s.clone()),
                                        Identifier::Literal(_) => return None,
                                    }
                                }
                            }
                        };
                        None
                    })
                    .collect::<BTreeSet<String>>();
                Ok(captrue_from_sc)
            }
            Formula::Not(formula) => formula.captures(side_con),
            Formula::Forall {
                identifier,
                formula,
            }
            | Formula::Exists {
                identifier,
                formula,
            } => {
                if let Identifier::Element(name) = identifier {
                    let mut captured = BTreeSet::new();
                    captured.insert(name.clone());
                    let sub = formula.captures(side_con)?;
                    captured.extend(sub);
                    Ok(captured)
                } else {
                    Err(BackendError::BadRequest("malformed formula".to_string()))
                }
            }
        }
    }
    pub fn free_vars(&self, captured: BTreeSet<String>) -> BackendResult<BTreeSet<String>> {
        match self {
            Formula::And { lhs, rhs } | Formula::Or { lhs, rhs } | Formula::Imp { lhs, rhs } => {
                let lhs_free = lhs.free_vars(captured.clone())?;
                let rhs_free = rhs.free_vars(captured.clone())?;
                Ok(lhs_free.union(&rhs_free).cloned().collect())
            }
            Formula::Not(formula) => formula.free_vars(captured),
            Formula::Ident(identifier) => match identifier {
                Identifier::Element(s) => {
                    if captured.contains(s) {
                        Ok(BTreeSet::new())
                    } else {
                        let mut res = BTreeSet::new();
                        res.insert(s.to_string());
                        Ok(res)
                    }
                }
                Identifier::Literal(_) => Ok(BTreeSet::new()),
            },
            Formula::True => Ok(BTreeSet::new()),
            Formula::False => Ok(BTreeSet::new()),
            Formula::Exists {
                identifier,
                formula,
            }
            | Formula::Forall {
                identifier,
                formula,
            } => {
                let mut new_captured = captured.clone();
                match identifier {
                    Identifier::Element(s) => {
                        new_captured.insert(s.to_string());
                    }
                    Identifier::Literal(_) => {
                        return Err(BackendError::BadRequest(
                            "Variable of quantifier must be an element".to_string(),
                        ))
                    }
                }
                formula.free_vars(new_captured)
            }
            Formula::Predicate { identifiers, .. } => {
                let free = identifiers
                    .iter()
                    .filter_map(|i| match i {
                        Identifier::Element(s) => {
                            if captured.contains(s) {
                                None
                            } else {
                                Some(s.to_string())
                            }
                        }
                        Identifier::Literal(_) => None,
                    })
                    .collect::<BTreeSet<_>>();
                Ok(free)
            }
        }
    }
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
