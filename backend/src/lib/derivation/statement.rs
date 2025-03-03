use std::collections::{BTreeMap, BTreeSet};
use std::fmt::Display;

use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

use crate::api::models::SideCondition;
use crate::{
    error::{BackendError, BackendResult},
    lib::rule::{apply::get_formula, DerivationRule, RuleFormula, RuleIdentifier, Rules},
};

use super::formula::{Formula, Identifier};

#[derive(
    Serialize, Deserialize, Debug, Clone, ToSchema, IntoParams, Ord, PartialEq, PartialOrd, Eq,
)]
pub struct Statement {
    #[serde(default)]
    pub lhs: Vec<Formula>,
    pub formula: Formula,
    pub sidecondition: Vec<SideCondition>,
}

fn check_not_free_condition(
    formulas: Vec<&Formula>,
    var: &String,
    side_con: &Vec<SideCondition>,
) -> BackendResult<()> {
    // Check for concrete variables.
    let free_vars = formulas
        .iter()
        .flat_map(|f| f.free_vars(BTreeSet::new()))
        .fold(BTreeSet::new(), |mut acc, i| {
            acc.extend(i);
            acc
        });
    if free_vars.contains(var) {
        return Err(BackendError::BadRequest(
            "The variable must not be free in any formula of the lhs".to_string(),
        ));
    }

    for f in formulas {
        let everything_free = f.can_contain_any_free_variable()?;
        if everything_free {
            let captured = f.captures(side_con)?;
            if !captured.contains(var) {
                return Err(BackendError::BadRequest(format!(
                    "In {} the variable {} could occur freely",
                    f, var
                )));
            }
        }
    }
    Ok(())
}

impl Statement {
    pub fn can_apply(
        &self,
        rule: &DerivationRule,
        substitution: &BTreeMap<RuleIdentifier, String>,
    ) -> BackendResult<()> {
        // First check if the rule is applicable
        let res = match (&self.formula, &rule.conclusion.formula) {
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
        res?;

        // Check sideconditions

        match rule.name {
            Rules::Ax => {
                // The lhs must include the rhs.
                let rhs = &self.formula;
                let lhs = &self.lhs;
                if !lhs.contains(rhs) {
                    return Err(BackendError::BadRequest(
                        "The rhs must be in the lhs".to_string(),
                    ));
                }
            }
            Rules::ForallIntro => {
                if let Formula::Forall {
                    identifier: Identifier::Element(i),
                    ..
                } = self.formula.clone()
                {
                    check_not_free_condition(self.lhs.iter().collect(), &i, &self.sidecondition)?
                }
            }
            Rules::ExistsElim => {
                if let Some(rule_exists) = rule.premises.first() {
                    if let RuleFormula::Exists { identifier, .. } = &rule_exists.formula {
                        let chosen =
                            substitution
                                .get(identifier)
                                .ok_or(BackendError::BadRequest(
                                    "Could not find the exists identifier in the substitution"
                                        .to_string(),
                                ))?;
                        let mut formulas = self.lhs.clone();
                        formulas.push(self.formula.clone());
                        println!("Checking not free condition for formulas {:?}", formulas);
                        check_not_free_condition(
                            formulas.iter().collect(),
                            chosen,
                            &self.sidecondition,
                        )?
                    }
                }
            }
            Rules::AlphaExists => {
                if let Some(rule_exists) = rule.premises.first() {
                    if let RuleFormula::Exists { formula, .. } = rule_exists.formula.clone() {
                        if let RuleFormula::Substitution {
                            lhs: from, rhs: to, ..
                        } = *formula
                        {
                            let free_vars = self.formula.free_vars(BTreeSet::new())?;
                            let from = substitution.get(&from).ok_or(BackendError::BadRequest(
                                "Could not find the substitution".to_string(),
                            ))?;
                            let to = substitution.get(&to).ok_or(BackendError::BadRequest(
                                "Could not find the substitution".to_string(),
                            ))?;
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
                if let Some(rule_forall) = rule.premises.first() {
                    if let RuleFormula::Forall { formula, .. } = rule_forall.formula.clone() {
                        if let RuleFormula::Substitution {
                            lhs: from, rhs: to, ..
                        } = *formula
                        {
                            let free_vars = self.formula.free_vars(BTreeSet::new())?;
                            let from = substitution.get(&from).ok_or(BackendError::BadRequest(
                                "Could not find the substitution".to_string(),
                            ))?;
                            let to = substitution.get(&to).ok_or(BackendError::BadRequest(
                                "Could not find the substitution".to_string(),
                            ))?;

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
            _ => {}
        }
        Ok(())
    }

    pub fn apply_rule(
        &self,
        rule: DerivationRule,
        mapping: &mut BTreeMap<RuleIdentifier, Formula>,
        substitution: &mut BTreeMap<RuleIdentifier, String>,
    ) -> BackendResult<Vec<Statement>> {
        self.can_apply(&rule, substitution)?;

        if let RuleFormula::Substitution {
            identifier,
            lhs: from_ident,
            rhs: to_ident,
        } = &rule.conclusion.formula
        {
            let formula = get_formula(identifier, mapping)?;
            let from = substitution
                .get(from_ident)
                .ok_or(BackendError::BadRequest(
                    "Could not find the substitution".to_string(),
                ))?;
            let to = substitution.get(to_ident).ok_or(BackendError::BadRequest(
                "Could not find the substitution".to_string(),
            ))?;
            // println!("Substitution {:?} -> {:?}", from, to);
            let new_formula = formula.apply_substitution(to, from, BTreeSet::new())?;
            // println!("Substitution reversed {:?}", new_formula);
            mapping.insert(identifier.clone(), new_formula);
        }

        let conclusion = rule
            .conclusion
            .formula
            .apply_mapping(mapping, substitution)?;

        if self.formula != conclusion {
            return Err(BackendError::BadRequest(
                "The conclusion of the rule does not match the target formula".to_string(),
            ));
        }

        let res = rule
            .premises
            .iter()
            .map(|premise| {
                let formula = premise.formula.apply_mapping(mapping, substitution);
                let lhs = premise.lhs.as_ref().map(|i| get_formula(i, mapping));

                match (lhs, formula) {
                    (Some(Ok(lhs)), Ok(formula)) => {
                        let mut lhs = vec![lhs];
                        lhs.extend(self.lhs.clone());
                        Ok(Statement {
                            lhs,
                            formula,
                            sidecondition: self.sidecondition.clone(),
                        })
                    }
                    (None, Ok(formula)) => Ok(Statement {
                        lhs: self.lhs.clone(),
                        formula,
                        sidecondition: self.sidecondition.clone(),
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
}

impl Display for Statement {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let lhs = self
            .lhs
            .iter()
            .map(|f| f.to_string())
            .collect::<Vec<_>>()
            .join(", ");
        write!(f, "{} |- {}", lhs, self.formula)
    }
}
