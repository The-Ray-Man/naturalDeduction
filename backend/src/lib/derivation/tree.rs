use std::collections::{BTreeMap, BTreeSet};

use uuid::Uuid;

use crate::{
    api::models::Node,
    error::{BackendError, BackendResult},
    lib::{
        derivation::formula::{self, Identifier},
        rule::{DerivationRule, RuleFormula, RuleIdentifier, RuleStatement, Rules},
    },
};

use super::{formula::Formula, statement::Statement};

fn add_mapping(
    mapping: &mut BTreeMap<RuleIdentifier, Formula>,
    rule: &RuleIdentifier,
    formula: &Formula,
) -> BackendResult<()> {
    if let Some(formula_in_mapping) = mapping.get(&rule) {
        if formula_in_mapping != formula {
            return Err(BackendError::Unknown(format!("Mapping already exists for rule: {:?} with formula: {:?} but tried to add formula: {:?}", rule, formula_in_mapping, formula)));
        } else {
            return Ok(());
        }
    } else {
        mapping.insert(rule.clone(), formula.clone());
        return Ok(());
    }
}

fn infer_mapping_between_formula(
    formula_from: &Formula,
    formula_to: &Formula,
    from: &RuleIdentifier,
    to: &RuleIdentifier,
    element_mapping: &mut BTreeMap<RuleIdentifier, Formula>,
) -> BackendResult<()> {
    if formula_from == formula_to {
        match (from, to) {
            (RuleIdentifier::Element(from_str), RuleIdentifier::Element(to_str)) => {
                element_mapping.insert(
                    from.clone(),
                    Formula::Ident(Identifier::Element(from_str.clone())),
                );
                element_mapping.insert(
                    to.clone(),
                    Formula::Ident(Identifier::Element(to_str.clone())),
                );
            }
            _ => {
                return Err(BackendError::BadRequest(
                    "Could not infer mapping".to_string(),
                ));
            }
        }
    }
    match (formula_from, formula_to) {
        (
            Formula::Forall {
                identifier: identifier_from,
                formula: sub_formula_from,
            },
            Formula::Forall {
                identifier: identifier_to,
                formula: sub_formula_to,
            },
        )
        | (
            Formula::Exists {
                identifier: identifier_from,
                formula: sub_formula_from,
            },
            Formula::Exists {
                identifier: identifier_to,
                formula: sub_formula_to,
            },
        ) => {
            if identifier_from == identifier_to {
                // They are the same e.g. no mapping happend
                infer_mapping_between_formula(
                    sub_formula_from,
                    sub_formula_to,
                    from,
                    to,
                    element_mapping,
                )?;
            } else {
                // situations like this:
                // formula_from : A = forall x. p(x)
                // formula_to : B = forall y. p(y)
                // we have a ftion. therefore A[from -> to] = B
                // Therefore we have that from = x, to = y

                if let Some(old) =
                    element_mapping.insert(from.clone(), Formula::Ident(identifier_from.clone()))
                {
                    if old != Formula::Ident(identifier_from.clone()) {
                        return Err(BackendError::BadRequest(
                            "Could not infer mapping".to_string(),
                        ));
                    }
                }

                if let Some(old) =
                    element_mapping.insert(to.clone(), Formula::Ident(identifier_to.clone()))
                {
                    if old != Formula::Ident(identifier_to.clone()) {
                        return Err(BackendError::BadRequest(
                            "Could not infer mapping".to_string(),
                        ));
                    }
                }
            }
        }
        (
            Formula::Predicate {
                identifier: identifier_from,
                identifiers: identifiers_from,
            },
            Formula::Predicate {
                identifier: identifier_to,
                identifiers: identifiers_to,
            },
        ) => {
            if identifier_from != identifier_to {
                return Err(BackendError::BadRequest(
                    "Predicates can not be renamed".to_string(),
                ));
            }
            if identifiers_from.len() != identifiers_to.len() {
                return Err(BackendError::BadRequest(
                    "Predicates must have the same arity".to_string(),
                ));
            }

            for (ident_from, ident_to) in identifiers_from.iter().zip(identifiers_to.iter()) {
                if let Some(old) =
                    element_mapping.insert(from.clone(), Formula::Ident(ident_from.clone()))
                {
                    if old != Formula::Ident(ident_from.clone()) {
                        return Err(BackendError::BadRequest(
                            "Could not infer mapping".to_string(),
                        ));
                    }
                }

                if let Some(old) =
                    element_mapping.insert(to.clone(), Formula::Ident(ident_to.clone()))
                {
                    if old != Formula::Ident(ident_to.clone()) {
                        return Err(BackendError::BadRequest(
                            "Could not infer mapping".to_string(),
                        ));
                    }
                }
            }
        }
        (lhs, rhs) => {
            if lhs != rhs {
                return Err(BackendError::BadRequest(
                    "Could not infer mapping".to_string(),
                ));
            }
        }
    }
    Ok(())
}

fn infer_mapping_formula(
    formula: &Formula,
    rule: &RuleFormula,
    formula_mapping: &mut BTreeMap<RuleIdentifier, Formula>,
    element_mapping: &mut BTreeMap<RuleIdentifier, Formula>,
) -> BackendResult<()> {
    match (formula, rule) {
        (_, RuleFormula::Ident(rule_identifier)) => {
            add_mapping(formula_mapping, rule_identifier, formula)?
        }
        (
            Formula::Imp { lhs, rhs },
            RuleFormula::Imp {
                lhs: r_lhs,
                rhs: r_rhs,
            },
        )
        | (
            Formula::Or { lhs, rhs },
            RuleFormula::Or {
                lhs: r_lhs,
                rhs: r_rhs,
            },
        )
        | (
            Formula::And { lhs, rhs },
            RuleFormula::And {
                lhs: r_lhs,
                rhs: r_rhs,
            },
        ) => {
            add_mapping(formula_mapping, r_lhs, lhs)?;
            add_mapping(formula_mapping, r_rhs, rhs)?;
        }

        (Formula::Not(formula), RuleFormula::Not(rule_identifier)) => {
            add_mapping(formula_mapping, rule_identifier, formula)?;
        }
        (Formula::False, RuleFormula::False) | (Formula::True, RuleFormula::True) => {}
        (
            Formula::Exists {
                identifier,
                formula,
            },
            RuleFormula::Exists {
                identifier: r_identifier,
                formula: r_formula,
            },
        )
        | (
            Formula::Forall {
                identifier,
                formula,
            },
            RuleFormula::Forall {
                identifier: r_identifier,
                formula: r_formula,
            },
        ) => {
            add_mapping(
                element_mapping,
                r_identifier,
                &Formula::Ident(identifier.clone()),
            )?;
            infer_mapping_formula(formula, r_formula, formula_mapping, element_mapping)?;
        }
        (
            _,
            RuleFormula::Substitution {
                identifier,
                lhs,
                rhs,
            },
        ) => {
            if let Some(mapped_formula) = formula_mapping.get(&identifier) {
                infer_mapping_between_formula(mapped_formula, formula, lhs, rhs, element_mapping);
            }
        }
        (_, _) => {
            return Err(BackendError::BadRequest(
                "Could not infer mapping".to_string(),
            ))
        }
    }
    Ok(())
}

pub fn infer_mapping_stmt(
    statment: &Statement,
    rule: &RuleStatement,
    formula_mapping: &mut BTreeMap<RuleIdentifier, Formula>,
    element_mapping: &mut BTreeMap<RuleIdentifier, Formula>,
) -> BackendResult<()> {
    infer_mapping_formula(
        &statment.formula,
        &rule.formula,
        formula_mapping,
        element_mapping,
    )?;

    if let Some(lhs_rule) = &rule.lhs {
        if let Some(mapped_formula) = formula_mapping.get(lhs_rule) {
            if !statment.lhs.contains(mapped_formula) {
                return Err(BackendError::BadRequest(format!(
                    "Could not infer mapping. Rhs ({}) is not present in lhs.",
                    mapped_formula
                )));
            }
        }
    };
    Ok(())
}

impl Node {
    pub fn infer_mapping(
        self,
        all_nodes: &Vec<Node>,
    ) -> BackendResult<(
        BTreeMap<RuleIdentifier, Formula>,
        BTreeMap<RuleIdentifier, Formula>,
    )> {
        let applied_rule = Rules::get_rule(&self.rule);
        let identifiers = applied_rule.identifiers();

        let mut formula_mapping = BTreeMap::<RuleIdentifier, Formula>::new();
        let mut element_mapping = BTreeMap::<RuleIdentifier, Formula>::new();

        for i in 0..5 {
            infer_mapping_stmt(
                &self.statement,
                &applied_rule.conclusion,
                &mut formula_mapping,
                &mut element_mapping,
            )?;

            let child_nodes = self
                .premisses
                .iter()
                .map(|premiss_id| all_nodes.iter().find(|node| node.name == *premiss_id))
                .collect::<Option<Vec<&Node>>>()
                .ok_or_else(|| {
                    BackendError::BadRequest("Could not find all premisses".to_string())
                })?;

            let premisses = child_nodes
                .iter()
                .map(|node| node.statement.clone())
                .collect::<Vec<_>>();

            for (premiss, rule) in premisses.iter().zip(applied_rule.premises.iter()) {
                infer_mapping_stmt(premiss, rule, &mut formula_mapping, &mut element_mapping)?;
            }

            let mut all_mapped_identifiers = formula_mapping.keys().collect::<BTreeSet<_>>();
            all_mapped_identifiers.extend(element_mapping.keys());

            if all_mapped_identifiers == identifiers.iter().collect() {
                break;
            }
        }
        let mut all_mapped_identifiers = formula_mapping.keys().collect::<BTreeSet<_>>();
        all_mapped_identifiers.extend(element_mapping.keys());

        if all_mapped_identifiers != identifiers.iter().collect() {
            return Err(BackendError::BadRequest(
                "Could not infer mapping".to_string(),
            ));
        }

        Ok((formula_mapping, element_mapping))
    }
}

pub fn check_tree(root: Uuid, all_nodes: &Vec<Node>) -> BackendResult<()> {
    let root_node = all_nodes
        .iter()
        .find(|node| node.name == root)
        .ok_or_else(|| BackendError::BadRequest("Could not find root node".to_string()))?;
    let rule = Rules::get_rule(&root_node.rule);
    let identifier = rule.identifiers();

    let mut formula_mapping = BTreeMap::<RuleIdentifier, Formula>::new();
    let mut element_mapping = BTreeMap::<RuleIdentifier, Formula>::new();

    for i in 0..5 {
        (formula_mapping, element_mapping) = root_node.clone().infer_mapping(all_nodes)?;
    }

    let mut substitution = element_mapping
        .iter()
        .map(|(k, v)| match v {
            Formula::Ident(Identifier::Element(s)) => (k.clone(), s.clone()),
            _ => panic!("Could not translate element mapping to substitution {}", v),
        })
        .collect::<BTreeMap<RuleIdentifier, String>>();

    root_node.statement.can_apply(&rule, &substitution)?;

    for node in root_node.premisses.iter() {
        check_tree(*node, all_nodes)?;
    }
    Ok(())
}
