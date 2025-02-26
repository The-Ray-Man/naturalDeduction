use std::collections::BTreeMap;

use log::info;
use pest::iterators::Pair;
use pest::Parser;
use pest_derive::Parser;

use crate::api::formula_models::{Formula, Identifier};

#[derive(Parser)]
#[grammar = "./lib/grammar.pest"] // relative to src
pub struct LogicParser {}

impl LogicParser {
    pub fn parse_input(input: &str) -> Result<Formula, String> {
        let pairs = LogicParser::parse(Rule::main, input);
        let mut pairs = match pairs {
            Err(e) => return Err(e.to_string()),
            Ok(p) => p,
        };
        let first = pairs.next().unwrap();
        let captures = BTreeMap::new();
        let (_, f) = Self::parse_formula(0, first, &captures)?;
        Ok(f)
    }

    fn parse_formula(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        info!("parse formula");
        match pair.as_rule() {
            Rule::var => Self::parse_var(num, pair, captures),
            Rule::and => Self::parse_and(num, pair, captures),
            Rule::or => Self::parse_or(num, pair, captures),
            Rule::not => Self::parse_not(num, pair, captures),
            Rule::implication => Self::parse_impl(num, pair, captures),
            Rule::predicate => Self::parse_predicate(num, pair, captures),
            Rule::quantifier => Self::parse_quantifier(num, pair, captures),
            Rule::lit => Self::parse_literal(num, pair, captures),
            Rule::true_ => Self::parse_true(num, pair, captures),
            Rule::false_ => Self::parse_false(num, pair, captures),
            e => panic!("Unexpected rule: {:?}", e),
        }
        // todo!()
    }

    fn parse_true(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        Ok((num, Formula::True))
    }

    fn parse_false(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        Ok((num, Formula::False))
    }

    fn parse_literal(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        let name = pair.as_str();
        if let Some(capture_name) = captures.get(name) {
            Ok((
                num,
                Formula::Ident(Identifier::Literal(capture_name.to_string())),
            ))
        } else {
            Ok((num, Formula::Ident(Identifier::Literal(name.to_string()))))
        }
    }

    fn parse_var(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        info!("parse var {:?}", pair);
        let name = pair.as_str();
        if let Some(capture_name) = captures.get(name) {
            Ok((
                num,
                Formula::Ident(Identifier::Literal(capture_name.to_string())),
            ))
        } else {
            Ok((num, Formula::Ident(Identifier::Literal(name.to_string()))))
        }
    }

    fn parse_and(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        let mut pairs = pair.into_inner();
        let (num, f_lhs) =
            LogicParser::parse_formula(num, pairs.next().unwrap(), captures).unwrap();
        let (num, r_hs) = LogicParser::parse_formula(num, pairs.next().unwrap(), captures).unwrap();
        Ok((
            num,
            Formula::And {
                lhs: Box::new(f_lhs),
                rhs: Box::new(r_hs),
            },
        ))
    }

    fn parse_or(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        let mut pairs = pair.into_inner();
        let (num, f_lhs) =
            LogicParser::parse_formula(num, pairs.next().unwrap(), captures).unwrap();
        let (num, f_rhs) =
            LogicParser::parse_formula(num, pairs.next().unwrap(), captures).unwrap();
        Ok((
            num,
            Formula::Or {
                lhs: Box::new(f_lhs),
                rhs: Box::new(f_rhs),
            },
        ))
    }

    fn parse_not(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        let (num, f) =
            LogicParser::parse_formula(num, pair.into_inner().next().unwrap(), captures).unwrap();
        Ok((num, Formula::Not(Box::new(f))))
    }

    fn parse_quantifier(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        let pair = pair.into_inner().next().unwrap();
        match pair.as_rule() {
            Rule::forall => Self::parse_forall(num, pair, captures),
            Rule::exists => Self::parse_exists(num, pair, captures),
            _ => panic!("Unexpected quantifier: {}", pair),
        }
    }

    fn parse_impl(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        let mut pairs = pair.into_inner();
        let (num, f_lhs) =
            LogicParser::parse_formula(num, pairs.next().unwrap(), captures).unwrap();
        let (num, f_rhs) =
            LogicParser::parse_formula(num, pairs.next().unwrap(), captures).unwrap();
        Ok((
            num,
            Formula::Imp {
                lhs: Box::new(f_lhs),
                rhs: Box::new(f_rhs),
            },
        ))
    }

    fn parse_forall(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        let mut pairs = pair.into_inner();
        let _ = pairs.next().unwrap();
        let var = pairs.next().unwrap();
        info!("{:?}", var);
        let name = var.as_str();
        // let capure_name = format!("{}{}", name, num);
        let capure_name = name.to_string();

        let mut captures = captures.clone();
        captures.insert(name, capure_name.clone());
        let (num, f) =
            LogicParser::parse_formula(num + 1, pairs.next().unwrap(), &captures).unwrap();
        Ok((
            num,
            Formula::Forall {
                identifier: Identifier::Element(capure_name.to_string()),
                formula: Box::new(f),
            },
        ))
    }

    fn parse_exists(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        let mut pairs = pair.into_inner();
        let _ = pairs.next().unwrap();
        let var = pairs.next().unwrap();
        let name = var.as_str();
        // let capure_name = format!("{}{}", name, num);
        let capure_name = name.to_string();

        let mut captures = captures.clone();
        captures.insert(name, capure_name.clone());
        let (num, f) =
            LogicParser::parse_formula(num + 1, pairs.next().unwrap(), &captures).unwrap();
        Ok((
            num,
            Formula::Exists {
                identifier: Identifier::Element(capure_name.to_string()),
                formula: Box::new(f),
            },
        ))
    }

    fn parse_predicate(
        num: u32,
        pair: Pair<Rule>,
        captures: &BTreeMap<&str, String>,
    ) -> Result<(u32, Formula), String> {
        let mut pairs = pair.into_inner();
        let name = pairs.next().unwrap().as_str().to_string();
        info!("name: {}", name);
        let mut args = Vec::new();
        let arguments = pairs.next().unwrap().into_inner();
        for arg in arguments {
            let name = arg.as_str();
            if let Some(capture_name) = captures.get(name) {
                args.push(Identifier::Element(capture_name.to_string()));
            } else {
                args.push(Identifier::Element(name.to_string()));
            }
        }
        Ok((
            num,
            Formula::Predicate {
                identifier: Identifier::Element(name),
                identifiers: args,
            },
        ))
    }
}
