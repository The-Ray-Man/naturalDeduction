use core::panic;
use std::collections::{BTreeMap, BTreeSet};

use crate::{Formula};


#[derive(Clone, Debug)]
enum RuleFormula {
    Ident(u32),
    And(u32, u32),
    Or(u32, u32),
    Not(u32),
    Imp(u32, u32),
    False,
    True,
}

#[derive(Clone, Debug)]
struct DerivationRule {
    name: String,
    premises: Vec<(Option<u32>, RuleFormula)>,
    conclusion: RuleFormula,
}

#[derive(Debug, Clone, PartialEq, PartialOrd, Ord, Eq)]
pub struct Stmt {
    pub assumptions: BTreeSet<Formula>,
    pub formula: Formula,
}

pub struct TreeNode {
    premisses: BTreeSet<Stmt>,
    conclusion: Stmt,
}

fn can_apply_rule(formula: &Formula, rule: &DerivationRule) -> bool {
    match (&rule.conclusion, formula) {
        (RuleFormula::Ident(i), _) => true,
        (RuleFormula::And(i, j), Formula::And(f1, f2)) => true,
        (RuleFormula::Or(i, j), Formula::Or(f1, f2)) => true,
        (RuleFormula::Not(i), Formula::Not(f)) => true,
        (RuleFormula::Imp(i, j), Formula::Imp(f1, f2)) => true,
        (RuleFormula::False, Formula::False) => true,
        (RuleFormula::True, Formula::True) => true,
        _ => false,
    }
}

pub fn apply_matching(
    matching: &mut BTreeMap<u32, Formula>,
    formula: RuleFormula,
    sub_formula: BTreeSet<Formula>,
) -> Option<Formula> {
    let mut iterator = sub_formula.into_iter();
    match formula {
        RuleFormula::And(i, j) => {
            let mut lhs = matching.get(&i).map(|f| f.clone());

            if lhs.is_none() {
                let formula = iterator.next().unwrap();
                matching.insert(i, formula.clone());
                lhs = Some(formula);
            }

            let mut rhs = matching.get(&j).map(|f| f.clone());

            if rhs.is_none() {              let formula = iterator.next().unwrap();
                matching.insert(j, formula.clone());
                rhs = Some(formula);
            }

            Some(Formula::And(
                Box::new(lhs.unwrap().clone()),
                Box::new(rhs.unwrap().clone()),
            ))
        }
        RuleFormula::Or(i, j) => {
            let mut lhs = matching.get(&i).map(|f| f.clone());

            if lhs.is_none() {
                let formula = iterator.next().unwrap();
                matching.insert(i, formula.clone());
                lhs = Some(formula);
            }

            let mut rhs = matching.get(&j).map(|f| f.clone());

            if rhs.is_none() {              let formula = iterator.next().unwrap();
                matching.insert(j, formula.clone());
                rhs = Some(formula);
            }

            Some(Formula::Or(
                Box::new(lhs.unwrap().clone()),
                Box::new(rhs.unwrap().clone()),
            ))
        }
        RuleFormula::Not(i) => {
            let mut lhs = matching.get(&i).map(|f| f.clone());

            if lhs.is_none() {
                let formula = iterator.next().unwrap();
                matching.insert(i, formula.clone());
                lhs = Some(formula);
            }

            Some(Formula::Not(Box::new(lhs.unwrap().clone())))
        }
        RuleFormula::Imp(i, j) => {
            let mut lhs = matching.get(&i).map(|f| f.clone());

            if lhs.is_none() {
                let formula = iterator.next().unwrap();
                matching.insert(i, formula.clone());
                lhs = Some(formula);
            }

            let mut rhs = matching.get(&j).map(|f| f.clone());

            if rhs.is_none() {              let formula = iterator.next().unwrap();
                matching.insert(j, formula.clone());
                rhs = Some(formula);
            }

            Some(Formula::Imp(
                Box::new(lhs.unwrap().clone()),
                Box::new(rhs.unwrap().clone()),
            ))
        }
        RuleFormula::False => Some(Formula::False),
        RuleFormula::True => Some(Formula::True),
        RuleFormula::Ident(i) => Some(matching.get(&i)?.clone()),
        _ => panic!("Unexpected formula"),
    }
}

pub fn apply_rule(statement: Stmt, rule: &DerivationRule) -> BTreeSet<Stmt> {
    let mut matcher: BTreeMap<u32, Formula> = BTreeMap::new();

    // We match the formulas from the conclusion.
    match (statement.formula.clone(), rule.conclusion.clone()) {
        (Formula::And(lhs, rhs), RuleFormula::And(i, j)) => {
            matcher.insert(i, *lhs);
            matcher.insert(j, *rhs);
        }
        (Formula::Or(lhs, rhs), RuleFormula::Or(i, j)) => {
            matcher.insert(i, *lhs);
            matcher.insert(j, *rhs);
        }
        (Formula::Not(f), RuleFormula::Not(i)) => {
            matcher.insert(i, *f);
        }
        (Formula::Imp(lhs, rhs), RuleFormula::Imp(i, j)) => {
            matcher.insert(i, *lhs);
            matcher.insert(j, *rhs);
        }
        (Formula::False, RuleFormula::False) => {}
        (Formula::True, RuleFormula::True) => {}
        (_, RuleFormula::Ident(i)) => {
            matcher.insert(i, statement.formula.clone());
        }
        _ => panic!("Rule does not match formula"),
    }

    // We get all subformulas for guessing the missing formulas.
    let sub_formulas = get_sub_formulas(&statement.formula);

    // We apply the matching to every premise. If a new variable is found, we use a sub_formula to fill it in.
    let result: BTreeSet<Stmt> = rule
        .premises
        .clone()
        .into_iter()
        .map(|(lhs, rhs)| {
            let new_formula = apply_matching(&mut matcher, rhs, sub_formulas.clone()).unwrap();

            if let Some(lhs) = lhs {
                println!("lhs: {}", lhs);
                println!("matcher: {:?}", matcher);
                let assumption = matcher.get(&lhs).unwrap();
                let mut new_assumptions = statement.assumptions.clone();
                new_assumptions.insert(assumption.clone());
                Stmt {
                    assumptions: new_assumptions,
                    formula: new_formula.clone(),
                }
            } else {
                Stmt {
                    assumptions: statement.assumptions.clone(),
                    formula: new_formula,
                }
            }
        })
        .collect::<BTreeSet<_>>();

    result
}

pub fn get_sub_formulas(formula: &Formula) -> BTreeSet<Formula> {
    let mut result = BTreeSet::new();

    match formula {
        Formula::And(lhs, rhs) => {
            result.insert(*lhs.clone());
            result.insert(*rhs.clone());
            result.extend(get_sub_formulas(lhs));
            result.extend(get_sub_formulas(rhs));
        }
        Formula::Or(lhs, rhs) => {
            result.insert(*lhs.clone());
            result.insert(*rhs.clone());
            result.extend(get_sub_formulas(lhs));
            result.extend(get_sub_formulas(rhs));
        }
        Formula::Not(f) => {
            result.insert(*f.clone());
            result.extend(get_sub_formulas(f));
        }
        Formula::Imp(lhs, rhs) => {
            result.insert(*lhs.clone());
            result.insert(*rhs.clone());
            result.extend(get_sub_formulas(lhs));
            result.extend(get_sub_formulas(rhs));
        }
        _ => {}
    }

    result
}

// pub fn apply_step(depth:u32, statement: Stmt, rules: Vec<&DerivationRule>) -> bool {
//     if depth == 0 {
//         return false;
//     }
//
//     if statement.assumptions.contains(&statement.formula) {
//         println!("Axiom");
//         return true;
//     }
//
//     let possible_rules = rules
//         .iter()
//         .filter(|r| can_apply_rule(&statement.formula, r))
//         .collect::<Vec<_>>();
//
//     println!(
//         "Possible rules: {:?}",
//         possible_rules
//             .iter()
//             .map(|r| r.name.clone())
//             .collect::<Vec<_>>()
//     );
//
//     let results = possible_rules
//         .into_iter()
//         .map(|r| {
//             println!("Applying rule: {}", r.name);
//             let new_premises = apply_rule(statement.clone(), r);
//             println!("New premises: {:?}", new_premises.iter().map(|s| s.formula.to_string().clone()).collect::<Vec<_>>());
//             new_premises
//         })
//         .collect::<Vec<_>>();
//
//     let good_results = results
//         .into_iter()
//         .filter(|r| r.into_iter().all(|s| is_tautology(s.clone())))
//         .collect::<Vec<_>>();
//
//
//     good_results.iter().any(|r|{
//         r.iter().all(|s| apply_step(depth-1 ,s.clone(), rules.clone()))
//     })
// }


pub fn all_rules() -> [DerivationRule; 11] {
        let impl_intro = DerivationRule {
            name: "impl_intro".to_string(),
            premises: vec![(Some(0), RuleFormula::Ident(1))],
            conclusion: RuleFormula::Imp(0, 1),
        };

        let impl_elim = DerivationRule {
            name: "impl_elim".to_string(),
            premises: vec![
                (None, RuleFormula::Imp(2, 1)),
                (None, RuleFormula::Ident(2)),
            ],
            conclusion: RuleFormula::Ident(1),
        };

        let false_intro = DerivationRule {
            name: "false_intro".to_string(),
            premises: vec![(None, RuleFormula::False)],
            conclusion: RuleFormula::Ident(0),
        };

        let not_intro = DerivationRule {
            name: "not_intro".to_string(),
            premises: vec![(Some(0), RuleFormula::False)],
            conclusion: (RuleFormula::Not(0)),
        };

        let not_elim = DerivationRule {
            name: "not_elim".to_string(),
            premises: vec![(None, RuleFormula::Not(2)), (None, RuleFormula::Ident(2))],
            conclusion: RuleFormula::Ident(1),
        };

        let and_intro = DerivationRule {
            name: "and_intro".to_string(),
            premises: vec![(None, RuleFormula::Ident(0)), (None, RuleFormula::Ident(1))],
            conclusion: (RuleFormula::And(0, 1)),
        };

        let and_elim_l = DerivationRule {
            name: "and_elim_l".to_string(),
            premises: vec![(None, RuleFormula::And(0, 1))],
            conclusion: RuleFormula::Ident(0),
        };

        let and_elim_r = DerivationRule {
            name: "and_elim_r".to_string(),
            premises: vec![(None, RuleFormula::And(0, 1))],
            conclusion: RuleFormula::Ident(1),
        };

        let or_intro_l = DerivationRule {
            name: "or_intro_l".to_string(),
            premises: vec![(None, RuleFormula::Ident(0))],
            conclusion: RuleFormula::Or(0, 1),
        };

        let or_intro_r = DerivationRule {
            name: "or_intro_r".to_string(),
            premises: vec![(None, RuleFormula::Ident(1))],
            conclusion: RuleFormula::Or(0, 1),
        };

        let or_elim = DerivationRule {
            name: "or_elim".to_string(),
            premises: vec![
                (None, RuleFormula::Or(0, 1)),
                (Some(0), RuleFormula::Ident(2)),
                (Some(1), RuleFormula::Ident(2)),
            ],
            conclusion: RuleFormula::Ident(2),
        };

        let rules = [
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
        ];
        return rules
}