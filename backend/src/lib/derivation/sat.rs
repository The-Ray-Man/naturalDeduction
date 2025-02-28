use core::panic;
use std::collections::{BTreeMap, BTreeSet};

use log::info;
use z3::{
    ast::{self, Ast, Bool, Int},
    Config, Context, FuncDecl, SatResult, Solver, Sort,
};

use super::{
    formula::{Formula, Identifier},
    statement::Statement,
};

impl Formula {
    fn vars(
        &self,
        bool_vars: &mut BTreeSet<String>,
        predicate_vars: &mut BTreeSet<String>,
        predicates: &mut BTreeSet<(String, u32)>,
    ) {
        match self {
            Formula::And { lhs, rhs } | Formula::Or { lhs, rhs } | Formula::Imp { lhs, rhs } => {
                lhs.vars(bool_vars, predicate_vars, predicates);
                rhs.vars(bool_vars, predicate_vars, predicates);
            }
            Formula::Not(formula) => {
                formula.vars(bool_vars, predicate_vars, predicates);
            }
            Formula::True | Formula::False => {}
            Formula::Forall {
                identifier: Identifier::Element(x),
                formula,
            }
            | Formula::Exists {
                identifier: Identifier::Element(x),
                formula,
            } => {
                formula.vars(bool_vars, predicate_vars, predicates);
                predicate_vars.insert(x.to_string());
            }
            Formula::Predicate {
                identifier: Identifier::Element(p),
                identifiers: vec,
            } => {
                let vars = vec
                    .iter()
                    .map(|x| match x {
                        Identifier::Element(x) => x.to_string(),
                        _ => panic!("Should never happen"),
                    })
                    .collect::<BTreeSet<_>>();
                predicate_vars.extend(vars);
                predicates.insert((p.to_string(), vec.len() as u32));
            }
            Formula::Ident(Identifier::Literal(x)) => {
                bool_vars.insert(x.to_string());
            }
            _ => panic!("Should never happen"),
        }
    }

    pub fn build_formula<'a>(
        &self,
        ctx: &'a Context,
        bools: &'a BTreeMap<String, Bool<'a>>,
        predicates: &'a BTreeMap<String, FuncDecl<'a>>,
        pred_vars: &'a BTreeMap<String, Int<'a>>,
    ) -> Bool<'a> {
        match self {
            Formula::And { lhs, rhs } => {
                let lhs = lhs.build_formula(ctx, bools, predicates, pred_vars);
                let rhs = rhs.build_formula(ctx, bools, predicates, pred_vars);
                Bool::and(ctx, &[&lhs, &rhs])
            }
            Formula::Or { lhs, rhs } => {
                let lhs = lhs.build_formula(ctx, bools, predicates, pred_vars);
                let rhs = rhs.build_formula(ctx, bools, predicates, pred_vars);
                Bool::or(ctx, &[&lhs, &rhs])
            }
            Formula::Not(formula) => {
                let f = formula.build_formula(ctx, bools, predicates, pred_vars);
                f.not()
            }
            Formula::Ident(Identifier::Literal(name)) => {
                let bool = bools.get(name).unwrap();
                bool.clone()
            }
            Formula::Imp { lhs, rhs } => {
                let lhs = lhs.build_formula(ctx, bools, predicates, pred_vars);
                let rhs = rhs.build_formula(ctx, bools, predicates, pred_vars);
                lhs.implies(&rhs)
            }
            Formula::True => Bool::from_bool(ctx, true),
            Formula::False => Bool::from_bool(ctx, false),
            Formula::Forall {
                identifier: Identifier::Element(name),
                formula,
            } => {
                let name = pred_vars.get(name).unwrap();
                let f = formula.build_formula(ctx, bools, predicates, pred_vars);

                let forall_formula = ast::forall_const(ctx, &[name], &[], &f);

                forall_formula
            }
            Formula::Exists {
                identifier: Identifier::Element(name),
                formula,
            } => {
                let name = pred_vars.get(name).unwrap();
                let f = formula.build_formula(ctx, bools, predicates, pred_vars);

                let forall_formula = ast::exists_const(ctx, &[name], &[], &f);

                forall_formula
            }
            Formula::Predicate {
                identifier: Identifier::Element(name),
                identifiers: args,
            } => {
                let predicate = predicates.get(name).unwrap();
                let vars = args
                    .iter()
                    .map(|var| match var {
                        Identifier::Element(x) => pred_vars.get(x).unwrap(),
                        _ => panic!("Should never happen"),
                    })
                    .collect::<Vec<_>>();

                let first = vars.first().unwrap();
                let mut arguments = Vec::new();
                for elem in vars.iter() {
                    let arg = elem.to_owned() as &dyn Ast;
                    arguments.push(arg);
                }
                let result = predicate.apply(&arguments);
                result.as_bool().unwrap()
            }
            _ => panic!("Should never happen"),
        }
    }

    pub fn check(&self) -> bool {
        let mut bool_vars = BTreeSet::new();
        let mut predicate_names = BTreeSet::new();
        let mut predicate_vars = BTreeSet::new();

        self.vars(&mut bool_vars, &mut predicate_vars, &mut predicate_names);

        let cfg = Config::new();
        let ctx = &Context::new(&cfg);

        let domain_sort = Sort::int(ctx);
        let bool_sort = Sort::bool(ctx);

        let mut predicates = BTreeMap::new();

        for (p, arg_num) in predicate_names {
            let args = (0..arg_num)
                .into_iter()
                .map(|_| &domain_sort)
                .collect::<Vec<_>>();
            let func = FuncDecl::new(ctx, p.clone(), &args, &bool_sort);
            predicates.insert(p, func);
        }

        let mut bools = BTreeMap::new();
        for v in bool_vars {
            let func = Bool::new_const(ctx, v.clone());
            bools.insert(v, func);
        }

        let mut pred_vars = BTreeMap::new();
        for name in predicate_vars.into_iter() {
            let variable = ast::Int::new_const(ctx, name.clone());
            pred_vars.insert(name, variable);
        }

        let formula = self.build_formula(ctx, &bools, &predicates, &pred_vars);

        let solver = Solver::new(ctx);
        solver.assert(&formula.not());
        let result = solver.check();

        result == SatResult::Unsat
    }
}

impl Statement {
    fn build_implication(&self) -> Formula {
        if self.lhs.is_empty() {
            return self.formula.clone();
        }
        let assumptions = self.lhs.clone();

        let formula = self.formula.clone();

        let lhs = assumptions
            .into_iter()
            .reduce(|lhs, rhs| Formula::And {
                lhs: Box::new(lhs.clone()),
                rhs: Box::new(rhs.clone()),
            })
            .unwrap();

        Formula::Imp {
            lhs: Box::new(lhs.clone()),
            rhs: Box::new(formula.clone()),
        }
    }

    pub fn check(&self) -> bool {
        let formula = self.build_implication();
        formula.check()
    }
}

// pub fn build_formula_from_node(statement: Statement, premisses: Vec<Statement>) -> Formula {
//     let conclusion = build_implication(statement);
//     let premisses = premisses
//         .into_iter()
//         .map(build_implication)
//         .collect::<Vec<_>>();

//     let lhs = premisses
//         .into_iter()
//         .reduce(|lhs, rhs| Formula::And {
//             lhs: Box::new(lhs.clone()),
//             rhs: Box::new(rhs.clone()),
//         })
//         .unwrap();

//     Formula::Imp {
//         lhs: Box::new(lhs),
//         rhs: Box::new(conclusion),
//     }
// }

// pub fn check_node(statement: Statement, premisses: Vec<Statement>) -> bool {
//     let formula = build_formula_from_node(statement, premisses);
//     check_formula(formula)
// }
