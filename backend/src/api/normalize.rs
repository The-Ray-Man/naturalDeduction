use std::collections::BTreeMap;

use crate::error::{BackendError, BackendResult};

use super::formula_models::{Formula, Identifier};

static ASCII_LOWER: [char; 26] = [
    'x', 'y', 'z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
    'q', 'r', 's', 't', 'u', 'v', 'w',
];

static ASCII_UPPER: [char; 26] = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

pub struct Normalizer {
    literal: BTreeMap<String, Identifier>,
    element: BTreeMap<String, Identifier>,
    capture_element: BTreeMap<String, Identifier>,
    predicate: BTreeMap<String, Identifier>,
    literal_counter: u32,
    element_counter: u32,
    predicate_counter: u32,
}

impl Normalizer {
    pub fn next_literal(&mut self) -> BackendResult<Identifier> {
        let letter = ASCII_UPPER[self.literal_counter as usize];
        self.literal_counter += 1;
        if self.literal_counter >= 26 {
            return Err(BackendError::Unknown(
                "Too many different literals in the formula".to_string(),
            ));
        }
        Ok(Identifier::Literal(letter.to_string()))
    }

    pub fn next_element(&mut self) -> BackendResult<Identifier> {
        let letter = ASCII_LOWER[self.element_counter as usize];
        self.element_counter += 1;
        if self.element_counter >= 18 {
            return Err(BackendError::Unknown(
                "Too many different elements in the formula".to_string(),
            ));
        }
        Ok(Identifier::Element(letter.to_string()))
    }

    pub fn next_predicate(&mut self) -> BackendResult<Identifier> {
        let letter = ASCII_LOWER[self.predicate_counter as usize];
        self.predicate_counter += 1;
        if self.predicate_counter >= 26 {
            return Err(BackendError::Unknown(
                "Too many different predicates in the formula".to_string(),
            ));
        }
        Ok(Identifier::Element(letter.to_string()))
    }
}

pub fn normalize(formula: Formula, mapping: &mut Normalizer) -> BackendResult<Formula> {
    match formula {
        Formula::And { lhs, rhs } => Ok(Formula::And {
            lhs: Box::new(normalize(*lhs, mapping)?),
            rhs: Box::new(normalize(*rhs, mapping)?),
        }),
        Formula::Or { lhs, rhs } => Ok(Formula::Or {
            lhs: Box::new(normalize(*lhs, mapping)?),
            rhs: Box::new(normalize(*rhs, mapping)?),
        }),
        Formula::Imp { lhs, rhs } => Ok(Formula::Imp {
            lhs: Box::new(normalize(*lhs, mapping)?),
            rhs: Box::new(normalize(*rhs, mapping)?),
        }),
        Formula::Not(formula) => Ok(Formula::Not(Box::new(normalize(*formula, mapping)?))),
        Formula::True => Ok(Formula::True),
        Formula::False => Ok(Formula::False),
        Formula::Forall { .. } => todo!(),
        Formula::Exists { .. } => todo!(),
        Formula::Predicate { .. } => todo!(),
        Formula::Ident(Identifier::Literal(s)) => {
            if mapping.literal.contains_key(&s) {
                Ok(Formula::Ident(mapping.literal.get(&s).unwrap().clone()))
            } else {
                Ok(Formula::Ident(mapping.next_literal()?))
            }
        }
        _ => panic!("This should never happen"),
    }
}
