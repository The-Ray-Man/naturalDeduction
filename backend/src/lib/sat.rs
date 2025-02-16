use core::panic;
use std::{
    collections::{BTreeMap, BTreeSet, HashSet},
    fmt::Arguments,
};

use z3::{
    ast::{self, Ast, Bool, Datatype, Dynamic, Int, Set},
    Config, Context, FuncDecl, SatResult, Solver, Sort,
};

use crate::api::formula_models::{Formula, Identifier, Statement};

pub fn collect_vars(
    formula: &Formula,
    bool_vars: &mut BTreeSet<String>,
    predicate_vars: &mut BTreeSet<String>,
    predicates: &mut BTreeSet<String>,
) -> () {
    match formula {
        Formula::And(formula, formula1)
        | Formula::Or(formula, formula1)
        | Formula::Imp(formula, formula1) => {
            collect_vars(formula, bool_vars, predicate_vars, predicates);
            collect_vars(formula1, bool_vars, predicate_vars, predicates);
        }
        Formula::Not(formula) => {
            collect_vars(formula, bool_vars, predicate_vars, predicates);
        }
        // Formula::Lit(v) => {
        //     bool_vars.insert(v.to_string());
        // }
        Formula::True | Formula::False => {}
        // Formula::List(btree_set) => panic!("A formula should never contain a list"),
        Formula::Forall(Identifier::Element(x), formula)
        | Formula::Exists(Identifier::Element(x), formula) => {
            collect_vars(formula, bool_vars, predicate_vars, predicates);
            predicate_vars.insert(x.to_string());
        }
        Formula::Predicate(Identifier::Element(p), vec) => {
            let vars = vec
                .into_iter()
                .map(|x| match x {
                    Identifier::Element(x) => x.to_string(),
                    _ => panic!("Should never happen"),
                })
                .collect::<BTreeSet<_>>();
            predicate_vars.extend(vars);
            predicates.insert(p.to_string());
        }
        Formula::Ident(Identifier::Literal(x)) => {
            bool_vars.insert(x.to_string());
        }
        _ => panic!("Should never happen"),
    }
}

pub fn build_formula<'a>(
    ctx: &'a Context,
    formula: &Formula,
    bools: &'a BTreeMap<String, Bool<'a>>,
    predicates: &'a BTreeMap<String, FuncDecl<'a>>,
    pred_vars: &'a BTreeMap<String, Int<'a>>,
) -> Bool<'a> {
    match formula {
        Formula::And(lhs, rhs) => {
            let lhs = build_formula(ctx, lhs, bools, predicates, pred_vars);
            let rhs = build_formula(ctx, rhs, bools, predicates, pred_vars);
            Bool::and(ctx, &[&lhs, &rhs])
        }
        Formula::Or(lhs, rhs) => {
            let lhs = build_formula(ctx, lhs, bools, predicates, pred_vars);
            let rhs = build_formula(ctx, rhs, bools, predicates, pred_vars);
            Bool::or(ctx, &[&lhs, &rhs])
        }
        Formula::Not(formula) => {
            let f = build_formula(ctx, formula, bools, predicates, pred_vars);
            f.not()
        }
        Formula::Ident(Identifier::Literal(name)) => {
            let bool = bools.get(name).unwrap();
            bool.clone()
        }
        Formula::Imp(lhs, rhs) => {
            let lhs = build_formula(ctx, lhs, bools, predicates, pred_vars);
            let rhs = build_formula(ctx, rhs, bools, predicates, pred_vars);
            lhs.implies(&rhs)
        }
        Formula::True => Bool::from_bool(ctx, true),
        Formula::False => Bool::from_bool(ctx, false),
        Formula::Forall(Identifier::Element(name), formula) => {
            let name = pred_vars.get(name).unwrap();
            let f = build_formula(ctx, formula, bools, predicates, pred_vars);

            let forall_formula = ast::forall_const(ctx, &[name], &[], &f);

            forall_formula
        }
        Formula::Exists(Identifier::Element(name), formula) => {
            let name = pred_vars.get(name).unwrap();
            let f = build_formula(ctx, formula, bools, predicates, pred_vars);

            let forall_formula = ast::exists_const(ctx, &[name], &[], &f);

            forall_formula
        }
        Formula::Predicate(Identifier::Element(name), args) => {
            let predicate = predicates.get(name).unwrap();
            let vars = args
                .into_iter()
                .map(|var| match var {
                    Identifier::Element(x) => pred_vars.get(x).unwrap(),
                    _ => panic!("Should never happen"),
                })
                .collect::<Vec<_>>();

            let first = vars.get(0).unwrap();
            let argument = first.to_owned();
            let result = predicate.apply(&[argument]);
            result.as_bool().unwrap()
        }
        _ => panic!("Should never happen"),
    }
}

pub fn build_implication(statement: Statement) -> Formula {
    let assumptions = statement.lhs;

    if assumptions.len() == 0 {
        return statement.formula;
    }

    let formula = statement.formula;

    let lhs = assumptions
        .into_iter()
        .reduce(|lhs, rhs| Formula::And(Box::new(lhs.clone()), Box::new(rhs.clone())))
        .unwrap();

    let implication = Formula::Imp(Box::new(lhs), Box::new(formula));

    implication
}

pub fn build_formula_from_node(statement: Statement, premisses : Vec<Statement>) -> Formula {
    let conclusion = build_implication(statement);
    let premisses = premisses.into_iter().map(|s| build_implication(s)).collect::<Vec<_>>();

    let lhs = premisses
        .into_iter()
        .reduce(|lhs, rhs| Formula::And(Box::new(lhs.clone()), Box::new(rhs.clone())))
        .unwrap();

    let implication = Formula::Imp(Box::new(lhs), Box::new(conclusion));
    return implication;
}


pub fn check_formula(formula: Formula) -> bool {
    let mut bool_vars = BTreeSet::new();
    let mut predicate_names = BTreeSet::new();
    let mut predicate_vars = BTreeSet::new();

    collect_vars(
        &formula,
        &mut bool_vars,
        &mut predicate_vars,
        &mut predicate_names,
    );

    let cfg = Config::new();
    let ctx = &Context::new(&cfg);

    let domain_sort = Sort::int(ctx);
    let bool_sort = Sort::bool(ctx);

    let mut predicates = BTreeMap::new();

    for p in predicate_names {
        let func = FuncDecl::new(&ctx, p.clone(), &[&domain_sort], &bool_sort);
        predicates.insert(p, func);
    }

    let mut bools = BTreeMap::new();
    for v in bool_vars {
        let func = Bool::new_const(&ctx, v.clone());
        bools.insert(v, func);
    }

    let mut pred_vars = BTreeMap::new();
    for (i, name) in predicate_vars.into_iter().enumerate() {
        let variable = ast::Int::new_const(ctx, name.clone());
        pred_vars.insert(name, variable);
    }

    let formula = build_formula(&ctx, &formula, &bools, &predicates, &pred_vars);

    let solver = Solver::new(&ctx);
    solver.assert(&formula.not());
    let result = solver.check();
    println!("{:?}", result);

    result == SatResult::Unsat
}

pub fn is_tautology(statement: Statement) -> bool {
    let formula = build_implication(statement);
    check_formula(formula)
}

pub fn check_node(statement: Statement, premisses: Vec<Statement>) -> bool {
    let formula = build_formula_from_node(statement, premisses);
    check_formula(formula)
}
