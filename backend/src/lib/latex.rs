use crate::api::{exercise_models::Exercise, formula_models::{Formula, Statement}};

use serde::Serialize;
use utoipa::ToSchema;

#[derive(ToSchema, Serialize)]
pub struct Latex<T> where T: Serialize + ToLatex + ToSchema {
    data: T,
    latex: String
}

impl<T> From<T> for Latex<T> where T: Serialize + ToLatex + ToSchema {
    fn from(value: T) -> Self {
        Self { latex: value.to_latex_str(), data: value }
    }
}

pub trait ToLatex: Serialize + Sized + ToSchema {
    fn to_latex_str(&self) -> String;
    fn to_latex(self) -> Latex<Self> {
        Latex { latex: self.to_latex_str(), data: self }
    }
}

impl ToLatex for Formula {
    fn to_latex_str(&self) -> String {
        match self {
            Formula::And { lhs, rhs } => format!("({} \\land {})", lhs.to_latex_str(), rhs.to_latex_str()),
            Formula::Or { lhs, rhs } => format!("({} \\lor {})", lhs.to_latex_str(), rhs.to_latex_str()),
            Formula::Not(f) => format!("\\lnot {}", f.to_latex_str()),
            Formula::Imp { lhs, rhs } => format!("({} \\rightarrow {})", lhs.to_latex_str(), rhs.to_latex_str()),
            Formula::True => "\\top".to_string(),
            Formula::False => "\\bot".to_string(),
            Formula::Forall { identifier, formula } => format!("\\forall_{} {}", identifier, formula.to_latex_str()),
            Formula::Exists { identifier, formula } => format!("\\exists_{} {}", identifier, formula.to_latex_str()),
            Formula::Predicate { identifier, identifiers } => {
                let vars = identifiers
                    .iter()
                    .map(|x| x.to_string())
                    .collect::<Vec<_>>()
                    .join(", ");
                format!("{}({})", identifier, vars)
            }
            Formula::Ident(identifier) => identifier.to_string(),
        }
    }
}

impl ToLatex for Statement {
    fn to_latex_str(&self) -> String {
        let assumptions = self
            .lhs
            .iter()
            .map(|a| a.to_latex_str())
            .collect::<Vec<_>>()
            .join(", ");
        format!("{} \\vDash {}", assumptions, self.formula.to_latex_str())
    }
}

impl ToLatex for Exercise {
    fn to_latex_str(&self) -> String {
        self.exercise.to_latex_str()
    }
}