use std::collections::{BTreeMap, BTreeSet};

use log::info;
use uuid::Uuid;

use crate::{error::{BackendError, BackendResult}, lib::check_node};

use super::{
    exercise_models::Node, formula_models::{Formula, Identifier, Statement}, rule_models::{DerivationRule, RuleFormula, RuleIdentifier, RuleStatement, Rules}
};

impl Rules {
    pub fn all_rules() -> [DerivationRule; 18] {
        let ax = DerivationRule {
            name: Rules::Ax,
            premises: vec![],
            conclusion: RuleStatement {
                lhs: Some(RuleIdentifier::Formula(0)),
                formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
            },
        };

        let impl_intro = DerivationRule {
            name: Rules::ImplIntro,
            premises: vec![RuleStatement {
                lhs: Some(RuleIdentifier::Formula(0)),
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Imp { lhs: RuleIdentifier::Formula(0), rhs: RuleIdentifier::Formula(1) },
            },
        };

        let impl_elim = DerivationRule {
            name: Rules::ImplElim,
            premises: vec![
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Imp {
                        lhs: RuleIdentifier::Formula(0),
                        rhs: RuleIdentifier::Formula(1),
                    },
                },
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
                },
            ],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            },
        };

        let false_intro = DerivationRule {
            name: Rules::FalseElim,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::False,
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
            },
        };

        let not_intro = DerivationRule {
            name: Rules::NotIntro,
            premises: vec![RuleStatement {
                lhs: Some(RuleIdentifier::Formula(0)),
                formula: RuleFormula::False,
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Not(RuleIdentifier::Formula(0)),
            },
        };

        let not_elim = DerivationRule {
            name: Rules::NotElim,
            premises: vec![
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Not(RuleIdentifier::Formula(0)),
                },
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
                },
            ],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            },
        };

        let and_intro = DerivationRule {
            name: Rules::AndIntro,
            premises: vec![
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
                },
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
                },
            ],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::And { lhs: RuleIdentifier::Formula(0), rhs: RuleIdentifier::Formula(1) },
            },
        };

        let and_elim_l = DerivationRule {
            name: Rules::AndElimL,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::And { lhs: RuleIdentifier::Formula(0), rhs: RuleIdentifier::Formula(1) },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
            },
        };

        let and_elim_r = DerivationRule {
            name: Rules::AndElimR,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::And { lhs: RuleIdentifier::Formula(0), rhs: RuleIdentifier::Formula(1) },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            },
        };

        let or_intro_l = DerivationRule {
            name: Rules::OrIntroL,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Or { lhs: RuleIdentifier::Formula(0), rhs: RuleIdentifier::Formula(1) },
            },
        };

        let or_intro_r = DerivationRule {
            name: Rules::OrIntroR,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Or { lhs: RuleIdentifier::Formula(0), rhs: RuleIdentifier::Formula(1) },
            },
        };

        let or_elim = DerivationRule {
            name: Rules::OrElim,
            premises: vec![
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Or {
                        lhs: RuleIdentifier::Formula(0),
                        rhs: RuleIdentifier::Formula(1),
                    },
                },
                RuleStatement {
                    lhs: Some(RuleIdentifier::Formula(0)),
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(2)),
                },
                RuleStatement {
                    lhs: Some(RuleIdentifier::Formula(1)),
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(2)),
                },
            ],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(2)),
            },
        };

        let forall_intro = DerivationRule {
            name: Rules::ForallIntro,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Forall {
                    identifier: RuleIdentifier::Element("x".to_string()),
                    formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                },
            },
        };

        let forall_elim = DerivationRule {
            name: Rules::ForallElim,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Forall {
                    identifier: RuleIdentifier::Element("x".to_string()),
                    formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Substitution {
                    identifier: RuleIdentifier::Formula(0),
                    lhs: RuleIdentifier::Element("x".to_string()),
                    rhs: RuleIdentifier::Element("t".to_string()),
                },
            },
        };

        let exists_intro = DerivationRule {
            name: Rules::ExistsIntro,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Substitution {
                    identifier: RuleIdentifier::Formula(0),
                    lhs: RuleIdentifier::Element("x".to_string()),
                    rhs: RuleIdentifier::Element("t".to_string()),
                },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Exists {
                    identifier: RuleIdentifier::Element("x".to_string()),
                    formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                },
            },
        };

        let exists_elim = DerivationRule {
            name: Rules::ExistsElim,
            premises: vec![
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Exists {
                        identifier: RuleIdentifier::Element("x".to_string()),
                        formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                    },
                },
                RuleStatement {
                    lhs: Some(RuleIdentifier::Formula(0)),
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
                },
            ],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            },
        };

        let alpha_forall = DerivationRule {
            name: Rules::AlphaForall,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Forall {
                    identifier: RuleIdentifier::Element("y".to_string()),
                    formula: Box::new(RuleFormula::Substitution {
                        identifier: RuleIdentifier::Formula(0),
                        lhs: RuleIdentifier::Element("x".to_string()),
                        rhs: RuleIdentifier::Element("y".to_string()),
                    }),
                },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Forall {
                    identifier: RuleIdentifier::Element("x".to_string()),
                    formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                },
            },
        };
        let alpha_exists = DerivationRule {
            name: Rules::AlphaExists,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Exists {
                    identifier: RuleIdentifier::Element("y".to_string()),
                    formula: Box::new(RuleFormula::Substitution {
                        identifier: RuleIdentifier::Formula(0),
                        lhs: RuleIdentifier::Element("x".to_string()),
                        rhs: RuleIdentifier::Element("y".to_string()),
                    }),
                },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Exists {
                    identifier: RuleIdentifier::Element("x".to_string()),
                    formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                },
            },
        };

        let rules = [
            ax,
            impl_intro,
            impl_elim,
            false_intro,
            not_intro,
            not_elim,
            and_intro,
            and_elim_l,
            and_elim_r,
            or_intro_l,
            or_intro_r,
            or_elim,
            forall_intro,
            forall_elim,
            exists_intro,
            exists_elim,
            alpha_forall,
            alpha_exists,
        ];
        return rules;
    }
    pub fn get_rule(&self) -> DerivationRule {
        let all_rules = Rules::all_rules();
        let rule = all_rules
            .into_iter()
            .find(|rule| rule.name == *self)
            .unwrap();
        rule
    }
}

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

pub fn apply_mapping(
    formula: &RuleFormula,
    mapping: &BTreeMap<RuleIdentifier, Formula>,
    substitution: &BTreeMap<RuleIdentifier, String>,
) -> BackendResult<Formula> {
    info!("{:?}", formula);
    match formula {
        RuleFormula::Ident(i) => get_formula(i, mapping),
        RuleFormula::And { lhs, rhs } => {
            let lhs = get_formula(lhs, mapping)?;
            let rhs = get_formula(rhs, mapping)?;
            Ok(Formula::And { lhs: Box::new(lhs), rhs: Box::new(rhs) })
        }
        RuleFormula::Or { lhs, rhs } => {
            let lhs = get_formula(lhs, mapping)?;
            let rhs = get_formula(rhs, mapping)?;
            Ok(Formula::Or { lhs: Box::new(lhs), rhs: Box::new(rhs) })
        }
        RuleFormula::Not(i) => {
            let f = get_formula(i, mapping)?;
            Ok(Formula::Not(Box::new(f)))
        }
        RuleFormula::Imp { lhs, rhs } => {
            let lhs = get_formula(lhs, mapping)?;
            let rhs = get_formula(rhs, mapping)?;
            Ok(Formula::Imp { lhs: Box::new(lhs), rhs: Box::new(rhs) })
        }
        RuleFormula::False => Ok(Formula::False),
        RuleFormula::True => Ok(Formula::True),
        RuleFormula::Forall { identifier, formula } => {
            let f = apply_mapping(&formula, mapping, substitution)?;
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
        RuleFormula::Exists { identifier, formula } => {
            let f = apply_mapping(&formula, mapping, substitution)?;
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
        RuleFormula::Substitution { identifier, lhs, rhs } => {
            let f = get_formula(identifier, mapping)?;
            info!("{:?}", substitution);
            let from = substitution.get(&lhs);
            let to = substitution.get(&rhs);
            if let (Some(from), Some(to)) = (from, to) {
                apply_substitution(f, from, to, BTreeSet::new())
            } else {
                Err(BackendError::BadRequest(
                    "The substitution must be a valid substitution".to_string(),
                ))
            }
        }
    }
}

pub fn apply_substitution(
    f: Formula,
    from: &String,
    to: &String,
    captured: BTreeSet<String>,
) -> BackendResult<Formula> {
    match f {
        Formula::And { lhs, rhs } => Ok(Formula::And {
            lhs: Box::new(apply_substitution(*lhs, from, to, captured.clone())?),
            rhs: Box::new(apply_substitution(*rhs, from, to, captured.clone())?),
        }),
        Formula::Or { lhs, rhs } => Ok(Formula::Or {
            lhs: Box::new(apply_substitution(*lhs, from, to, captured.clone())?),
            rhs: Box::new(apply_substitution(*rhs, from, to, captured.clone())?),
        }),
        Formula::Not(formula) => Ok(Formula::Not(Box::new(apply_substitution(
            *formula, from, to, captured,
        )?))),
        Formula::Ident(identifier) => {
            let new_name = match identifier.clone() {
                Identifier::Element(s) | Identifier::Literal(s) => {
                    if s == from.to_string() {
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
            lhs: Box::new(apply_substitution(*lhs, from, to, captured.clone())?),
            rhs: Box::new(apply_substitution(*rhs, from, to, captured.clone())?),
        }),
        Formula::True => Ok(Formula::True),
        Formula::False => Ok(Formula::False),
        Formula::Forall { identifier, formula } => {
            let name = match &identifier {
                Identifier::Element(s) | Identifier::Literal(s) => s,
            };
            let mut new_capture = captured.clone();
            new_capture.insert(name.clone());
            Ok(Formula::Forall {
                identifier,
                formula: Box::new(apply_substitution(*formula, from, to, new_capture)?),
            })
        }
        Formula::Exists { identifier, formula } => {
            let name = match &identifier {
                Identifier::Element(s) => s,
                Identifier::Literal(_) => Err(BackendError::BadRequest(
                    "The variable must be an simple element i.e. Not a formula.".to_string(),
                ))?,
            };
            let mut new_capture = captured.clone();
            new_capture.insert(name.clone());
            Ok(Formula::Exists {
                identifier,
                formula: Box::new(apply_substitution(*formula, from, to, new_capture)?),
            })
        }
        Formula::Predicate { identifier, identifiers } => {
            let new_identifiers = identifiers
                .into_iter()
                .map(|i| match i {
                    Identifier::Element(s) | Identifier::Literal(s) => {
                        if s == from.to_string() {
                            if captured.contains(to) {
                                return Err(BackendError::BadRequest(
                                    "Substitution results in Capture of variable".to_string(),
                                ));
                            }
                            Ok(Identifier::Element(to.to_string()))
                        } else {
                            Ok(Identifier::Element(s))
                        }
                    }
                })
                .collect::<Result<Vec<Identifier>, BackendError>>()?;
            Ok(Formula::Predicate { identifier, identifiers: new_identifiers })
        }
    }
}

pub fn get_free_vars(
    formula: &Formula,
    captured: BTreeSet<String>,
) -> BackendResult<BTreeSet<String>> {
    match formula {
        Formula::And { lhs, rhs } | Formula::Or { lhs, rhs } | Formula::Imp { lhs, rhs } => {
            let lhs_free = get_free_vars(lhs, captured.clone())?;
            let rhs_free = get_free_vars(rhs, captured.clone())?;
            Ok(lhs_free.union(&rhs_free).cloned().collect())
        }
        Formula::Not(formula) => get_free_vars(formula, captured),
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
        Formula::Exists { identifier, formula } | Formula::Forall { identifier, formula } => {
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
            get_free_vars(formula, new_captured)
        }
        Formula::Predicate { identifiers, .. } => {
            let free = identifiers
                .into_iter()
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

pub fn legal_rule(
    target: &Statement,
    rule: &DerivationRule,
    substitution: &BTreeMap<RuleIdentifier, String>,
) -> BackendResult<()> {
    // First check if the rule is applicable
    info!("{:?}", target.formula);
    let res = match (&target.formula, &rule.conclusion.formula) {
        (_, RuleFormula::Ident(_)) => Ok(()),
        (Formula::And { .. }, RuleFormula::And { .. }) => Ok(()),
        (Formula::Or { .. }, RuleFormula::Or { .. }) => Ok(()),
        (Formula::Not(_), RuleFormula::Not(_)) => Ok(()),
        (Formula::Imp { .. }, RuleFormula::Imp { .. }) => Ok(()),
        (Formula::True, RuleFormula::True) => Ok(()),
        (Formula::False, RuleFormula::False) => Ok(()),
        (Formula::Forall { .. }, RuleFormula::Forall { .. }) => Ok(()),
        (Formula::Exists { .. }, RuleFormula::Exists { .. }) => Ok(()),
        (Formula::Predicate { .. }, RuleFormula::Ident(_)) => Ok(()),
        (_, RuleFormula::Substitution { .. }) => Ok(()),
        _ => Err(BackendError::BadRequest(
            "The rule is not applicable".to_string(),
        )),
    };
    let _ = res?;

    // Check sideconditions

    match rule.name {
        Rules::Ax => {
            // The lhs must include the rhs.
            let rhs = &target.formula;
            info!("{:?}", rhs);
            info!("{:?}", target.lhs);
            let lhs = &target.lhs;
            if !lhs.contains(rhs) {
                return Err(BackendError::BadRequest(
                    "The rhs must be in the lhs".to_string(),
                ));
            }
        }
        Rules::ForallIntro => {
            if let Formula::Forall { identifier: Identifier::Element(i), .. } = target.formula.clone() {
                let free_vars = get_free_vars(&target.formula, BTreeSet::new())?;
                if free_vars.contains(&i) {
                    return Err(BackendError::BadRequest(
                        "The variable must not be free in any formula of the lhs".to_string(),
                    ));
                }
            }
        }
        Rules::ExistsElim => {
            if let Some(rule_exists) = rule.premises.get(0) {
                if let RuleFormula::Exists { identifier, .. } = &rule_exists.formula {
                    let chosen = substitution.get(&identifier).ok_or(BackendError::BadRequest(
                        "Could not find the exists identifier in the substitution".to_string(),
                    ))?;
                    let free_vars = get_free_vars(&target.formula, BTreeSet::new())?;
                    let lhs_free_vars = target.lhs.iter().fold(
                        Ok(BTreeSet::new()),
                        |acc: Result<BTreeSet<String>, BackendError>, elem: &Formula| {
                            let acc = acc?;
                            let free = get_free_vars(elem, BTreeSet::new());
                            match free {
                                Ok(free) => Ok(acc.union(&free).cloned().collect()),
                                Err(err) => Err(err),
                            }
                        },
                    )?;
                    if free_vars.contains(chosen) || lhs_free_vars.contains(chosen) {
                        return Err(BackendError::BadRequest(
                            "The chosen variable must not be free in the target formula"
                                .to_string(),
                        ));
                    }
                }
            }
        }
        Rules::AlphaExists => {
            if let Some(rule_exists) = rule.premises.get(0) {
                if let RuleFormula::Exists { formula, .. } = rule_exists.formula.clone() {
                    if let RuleFormula::Substitution { lhs: from, rhs: to, .. } = *formula {
                        let free_vars = get_free_vars(&target.formula, BTreeSet::new())?;
                        let from = substitution.get(&from).ok_or(BackendError::BadRequest(
                            "Could not find the substitution".to_string(),
                        ))?;
                        let to = substitution.get(&to).ok_or(BackendError::BadRequest(
                            "Could not find the substitution".to_string(),
                        ))?;
                        info!("FREE VARS {:?}", free_vars);
                        info!("SUBSTITUTION {} -> {}", from, to);
                        if free_vars.contains(to) {
                            return Err(BackendError::BadRequest(
                                "The variable to be substituted must not be free in the target formula"
                                    .to_string(),
                            ));
                        }
                    }
                }
            }
        }
        Rules::AlphaForall => {
            if let Some(rule_forall) = rule.premises.get(0) {
                if let RuleFormula::Forall { formula, .. } = rule_forall.formula.clone() {
                    if let RuleFormula::Substitution {
                        lhs: RuleIdentifier::Element(_),
                        rhs: RuleIdentifier::Element(to),
                        ..
                    } = *formula
                    {
                        let free_vars = get_free_vars(&target.formula, BTreeSet::new())?;
                        if free_vars.contains(&to) {
                            return Err(BackendError::BadRequest(
                                "The variable to be substituted must not be free in the target formula"
                                    .to_string(),
                            ));
                        }
                    }
                }
            }
        }
        _ => {}
    }
    Ok(())
}

pub fn apply_rule(
    target: Statement,
    rule: DerivationRule,
    mapping: &mut BTreeMap<RuleIdentifier, Formula>,
    substitution: &mut BTreeMap<RuleIdentifier, String>,
) -> BackendResult<Vec<Statement>> {
    let _ = legal_rule(&target, &rule, substitution)?;

    if let RuleFormula::Substitution { identifier, lhs: from_ident, rhs: to_ident } = &rule.conclusion.formula {
        let formula = get_formula(&identifier, mapping)?;
        let from = substitution
            .get(&from_ident)
            .ok_or(BackendError::BadRequest(
                "Could not find the substitution".to_string(),
            ))?;
        let to = substitution.get(&to_ident).ok_or(BackendError::BadRequest(
            "Could not find the substitution".to_string(),
        ))?;
        // println!("Substitution {:?} -> {:?}", from, to);
        let new_formula = apply_substitution(formula, &to, &from, BTreeSet::new())?;
        // println!("Substitution reversed {:?}", new_formula);
        mapping.insert(identifier.clone(), new_formula);
    }

    let conclusion = apply_mapping(&rule.conclusion.formula, mapping, substitution)?;

    if target.formula != conclusion {
        return Err(BackendError::BadRequest(
            "The conclusion of the rule does not match the target formula".to_string(),
        ));
    }


    let res = rule
        .premises
        .iter()
        .map(|premise| {
            let formula = apply_mapping(&premise.formula, &mapping, substitution);
            let lhs = match &premise.lhs {
                Some(i) => {
                    let f = Some(get_formula(&i, mapping));
                    f
                }
                None => None,
            };

            info!("Premise {:?} -> {:?}", lhs, formula);
            match (lhs, formula) {
                (Some(Ok(lhs)), Ok(formula)) => {
                    let mut lhs = vec![lhs];
                    lhs.extend(target.lhs.clone());
                    Ok(Statement { lhs, formula })
                }
                (None, Ok(formula)) => Ok(Statement {
                    lhs: target.lhs.clone(),
                    formula,
                }),
                (Some(Err(err)), _) => Err(err),
                (_, Err(err)) => Err(err),
                _ => Err(BackendError::BadRequest(
                    "Could not apply mapping".to_string(),
                )),
            }
        })
        .collect::<Vec<_>>();

    let mut premisses = Vec::new();
    for r in res {
        match r {
            Ok(formula) => premisses.push(formula),
            Err(err) => return Err(err),
        }
    }

    Ok(premisses)
}


pub fn check_tree(root: Uuid, nodes: Vec<Node>) -> bool {

    let root_node = nodes.iter().find(|n| n.name == root);

    let root_node = match root_node {
        Some(node) => node.clone(),
        None => return false,
    };

    let premisses = nodes.iter().filter(|n| root_node.premisses.contains(&n.name)).collect::<Vec<_>>();

    let statements = premisses.iter().map(|n| n.statement.clone()).collect::<Vec<_>>();

    let valid = check_node(root_node.statement,statements);

    for premiss in premisses {
        let valid = check_tree(premiss.name, nodes.clone());
        if !valid {
            return false;
        }
    }

    return valid;
}