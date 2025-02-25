// mod derivation;
// mod latex;
mod parsing;
// mod derivation;
mod sat;
// use derivation::{apply_rule, apply_step, Stmt};
// use latex::toLatex;
pub use parsing::LogicParser;
pub use sat::{check_node, is_tautology};
// use pest::{
//     iterators::Pair,
//     pratt_parser::{Op, PrattParser},
//     Parser,
// };
// use pest_derive::Parser;
// use sat::is_tautology;
// type Literal = String;

// type F = Box<Formula>;
// use std::cmp::Ordering;

// #[derive(Debug, Clone)]
// enum Formula {
//     And(F, F),
//     Or(F, F),
//     Not(F),
//     Lit(Literal),
//     Imp(F, F),
//     True,
//     False,
//     Forall(Literal, F),
//     Exists(Literal, F),
//     Predicate(String, Vec<Literal>),
// }

// impl PartialEq for Formula {
//     fn eq(&self, other: &Self) -> bool {
//         self.to_string() == other.to_string()
//     }
// }

// impl Eq for Formula {}

// impl PartialOrd for Formula {
//     fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
//         Some(self.cmp(other))
//     }
// }

// impl Ord for Formula {
//     fn cmp(&self, other: &Self) -> Ordering {
//         self.to_string().cmp(&other.to_string())
//     }
// }

// impl ToString for Formula {
//     fn to_string(&self) -> String {
//         match self {
//             Formula::And(f1, f2) => format!("({} ∧ {})", f1.to_string(), f2.to_string()),
//             Formula::Or(f1, f2) => format!("({} ∨ {})", f1.to_string(), f2.to_string()),
//             Formula::Not(f) => format!("¬{}", f.to_string()),
//             Formula::Lit(l) => l.to_string(),
//             Formula::Imp(f1, f2) => format!("({} → {})", f1.to_string(), f2.to_string()),
//             Formula::True => "T".to_string(),
//             Formula::False => "F".to_string(),
//             Formula::List(l) => {
//                 let mut s = "{".to_string();
//                 for f in l {
//                     s.push_str(&f.to_string());
//                     s.push_str(", ");
//                 }
//                 s.push_str("}");
//                 s
//             }
//             Formula::Forall(v, f) => format!("∀{} {}", v, f.to_string()),
//             Formula::Exists(v, f) => format!("∃{} {}", v, f.to_string()),
//             Formula::Predicate(p, args) => {
//                 let mut s = p.to_string();
//                 let arguments = args.join(", ");
//                 s.push_str(&format!("({})", arguments));
//                 s
//             }
//         }
//     }
// }

// #[derive(Clone, Debug)]
// enum RuleFormula {
//     Ident(u32),
//     And(u32, u32),
//     Or(u32, u32),
//     Not(u32),
//     Imp(u32, u32),
//     False,
//     True,
// }

// #[derive(Clone, Debug)]
// struct DerivationRule {
//     name: String,
//     premises: Vec<(Option<u32>, RuleFormula)>,
//     conclusion: RuleFormula,
// }

// fn main() {
//     let impl_intro = DerivationRule {
//         name: "impl_intro".to_string(),
//         premises: vec![(Some(0), RuleFormula::Ident(1))],
//         conclusion: RuleFormula::Imp(0, 1),
//     };

//     let impl_elim = DerivationRule {
//         name: "impl_elim".to_string(),
//         premises: vec![
//             (None, RuleFormula::Imp(2, 1)),
//             (None, RuleFormula::Ident(2)),
//         ],
//         conclusion: RuleFormula::Ident(1),
//     };

//     let false_intro = DerivationRule {
//         name: "false_intro".to_string(),
//         premises: vec![(None, RuleFormula::False)],
//         conclusion: RuleFormula::Ident(0),
//     };

//     let not_intro = DerivationRule {
//         name: "not_intro".to_string(),
//         premises: vec![(Some(0), RuleFormula::False)],
//         conclusion: (RuleFormula::Not(0)),
//     };

//     let not_elim = DerivationRule {
//         name: "not_elim".to_string(),
//         premises: vec![(None, RuleFormula::Not(2)), (None, RuleFormula::Ident(2))],
//         conclusion: RuleFormula::Ident(1),
//     };

//     let and_intro = DerivationRule {
//         name: "and_intro".to_string(),
//         premises: vec![(None, RuleFormula::Ident(0)), (None, RuleFormula::Ident(1))],
//         conclusion: (RuleFormula::And(0, 1)),
//     };

//     let and_elim_l = DerivationRule {
//         name: "and_elim_l".to_string(),
//         premises: vec![(None, RuleFormula::And(0, 1))],
//         conclusion: RuleFormula::Ident(0),
//     };

//     let and_elim_r = DerivationRule {
//         name: "and_elim_r".to_string(),
//         premises: vec![(None, RuleFormula::And(0, 1))],
//         conclusion: RuleFormula::Ident(1),
//     };

//     let or_intro_l = DerivationRule {
//         name: "or_intro_l".to_string(),
//         premises: vec![(None, RuleFormula::Ident(0))],
//         conclusion: RuleFormula::Or(0, 1),
//     };

//     let or_intro_r = DerivationRule {
//         name: "or_intro_r".to_string(),
//         premises: vec![(None, RuleFormula::Ident(1))],
//         conclusion: RuleFormula::Or(0, 1),
//     };

//     let or_elim = DerivationRule {
//         name: "or_elim".to_string(),
//         premises: vec![
//             (None, RuleFormula::Or(0, 1)),
//             (Some(0), RuleFormula::Ident(2)),
//             (Some(1), RuleFormula::Ident(2)),
//         ],
//         conclusion: RuleFormula::Ident(2),
//     };

//     let rules = [
//         // &impl_intro,
//         // &impl_elim,
//         // &false_intro,
//         // &not_intro,
//         // &not_elim,
//         // &and_intro,
//         // &and_elim_l,
//         // &and_elim_r,
//         &or_intro_l,
//         &or_intro_r,
//         &or_elim,
//     ];

//     let input = "(not r(k)) -> ( ( r(k) or (exists_y (q(y)))) -> (forall_x (not q(x))))";
//     // let input = "(forall_x (p(x))) -> (exists_y (p(y)))";
//     let input = "a or (not a)";

//     let f = LogicParser::parse_input(input).unwrap();
//     let assumptions = BTreeSet::new();
//     let stmt = Stmt {
//         assumptions,
//         formula: f,
//     };
//     let result = apply_step(5,stmt, rules.into_iter().collect::<Vec<_>>());
//     println!("{}", result);
// }
