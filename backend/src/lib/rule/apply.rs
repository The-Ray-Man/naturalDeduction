use std::collections::{BTreeMap, BTreeSet};

use log::info;

use crate::{
    error::{BackendError, BackendResult},
    lib::derivation::formula::{Formula, Identifier},
};

use super::{RuleFormula, RuleIdentifier};

pub fn get_formula(
    i: &RuleIdentifier,
    mapping: &BTreeMap<RuleIdentifier, Formula>,
) -> BackendResult<Formula> {
    match mapping.get(i) {
        Some(f) => Ok(f.clone()),
        None => {
            let name = match i {
                RuleIdentifier::Element(s) => s.to_string(),
                RuleIdentifier::Formula(s) => s.to_string(),
            };
            Err(BackendError::IdNotFound {
                entity: "Identifier".to_string(),
                id: name.to_string(),
            })
        }
    }
}

impl RuleFormula {
    pub fn apply_mapping(
        &self,
        mapping: &BTreeMap<RuleIdentifier, Formula>,
        substitution: &BTreeMap<RuleIdentifier, String>,
    ) -> BackendResult<Formula> {
        match self {
            RuleFormula::Ident(i) => get_formula(i, mapping),
            RuleFormula::And { lhs, rhs } => {
                let lhs = get_formula(lhs, mapping)?;
                let rhs = get_formula(rhs, mapping)?;
                Ok(Formula::And {
                    lhs: Box::new(lhs),
                    rhs: Box::new(rhs),
                })
            }
            RuleFormula::Or { lhs, rhs } => {
                let lhs = get_formula(lhs, mapping)?;
                let rhs = get_formula(rhs, mapping)?;
                Ok(Formula::Or {
                    lhs: Box::new(lhs),
                    rhs: Box::new(rhs),
                })
            }
            RuleFormula::Not(i) => {
                let f = get_formula(i, mapping)?;
                Ok(Formula::Not(Box::new(f)))
            }
            RuleFormula::Imp { lhs, rhs } => {
                let lhs = get_formula(lhs, mapping)?;
                let rhs = get_formula(rhs, mapping)?;
                Ok(Formula::Imp {
                    lhs: Box::new(lhs),
                    rhs: Box::new(rhs),
                })
            }
            RuleFormula::False => Ok(Formula::False),
            RuleFormula::True => Ok(Formula::True),
            RuleFormula::Forall {
                identifier,
                formula,
            } => {
                let f = formula.apply_mapping(mapping, substitution)?;
                let i = substitution.get(identifier);
                if i.is_none() {
                    return Err(BackendError::BadRequest(
                        "The variable must be a valid substitution".to_string(),
                    ));
                }
                let captured_variable = i.unwrap();
                Ok(Formula::Forall {
                    identifier: Identifier::Element(captured_variable.to_string()),
                    formula: Box::new(f),
                })
            }
            RuleFormula::Exists {
                identifier,
                formula,
            } => {
                let f = formula.apply_mapping(mapping, substitution)?;
                // let f = get_formula(&**f, mapping)?;
                let i = substitution.get(identifier);
                if i.is_none() {
                    return Err(BackendError::BadRequest(
                        "The variable must be a valid substitution".to_string(),
                    ));
                }
                let captured_variable = i.unwrap();
                Ok(Formula::Exists {
                    identifier: Identifier::Element(captured_variable.to_string()),
                    formula: Box::new(f),
                })
            }
            RuleFormula::Substitution {
                identifier,
                lhs,
                rhs,
            } => {
                let f = get_formula(identifier, mapping)?;
                info!("{:?}", substitution);
                let from = substitution.get(lhs);
                let to = substitution.get(rhs);
                if let (Some(from), Some(to)) = (from, to) {
                    f.apply_substitution(from, to, BTreeSet::new())
                } else {
                    Err(BackendError::BadRequest(
                        "The substitution must be a valid substitution".to_string(),
                    ))
                }
            }
        }
    }
}
