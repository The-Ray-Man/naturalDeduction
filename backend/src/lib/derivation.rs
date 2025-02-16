use core::panic;
use std::collections::{BTreeMap, BTreeSet};

use crate::api::models::Formula;




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