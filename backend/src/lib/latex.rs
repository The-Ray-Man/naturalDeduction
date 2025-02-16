use crate::{derivation::Stmt, Formula};

pub trait toLatex {
    fn to_latex(&self) -> String;
}

impl toLatex for Formula {
    fn to_latex(&self) -> String {
        match self {
            Formula::And(f1, f2) => format!("({} \\land {})", f1.to_latex(), f2.to_latex()),
            Formula::Or(f1, f2) => format!("({} \\lor {})", f1.to_latex(), f2.to_latex()),
            Formula::Not(f) => format!("\\lnot {}", f.to_latex()),
            Formula::Lit(l) => l.to_string(),
            Formula::Imp(f1, f2) => format!("({} \\rightarrow {})", f1.to_latex(), f2.to_latex()),
            Formula::True => "\\top".to_string(),
            Formula::False => "\\bot".to_string(),
            Formula::List(btree_set) => panic!("A formula should never contain a list"),
            Formula::Forall(x, f) => format!("\\forall_{} {}", x, f.to_latex()),
            Formula::Exists(x, f) => format!("\\exists_{} {}", x, f.to_latex()),
            Formula::Predicate(p, vec) => {
                let vars = vec
                    .into_iter()
                    .map(|x| x.to_string())
                    .collect::<Vec<_>>()
                    .join(", ");
                format!("{}({})", p, vars)
            }
        }
    }
}

impl toLatex for Stmt {
    fn to_latex(&self) -> String {
        let assumptions = self
            .assumptions
            .iter()
            .map(|a| a.to_latex())
            .collect::<Vec<_>>()
            .join(", ");
        format!("{} \\vDash {}", assumptions, self.formula.to_latex())
    }
}
