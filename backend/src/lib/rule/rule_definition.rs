use super::{DerivationRule, RuleFormula, RuleIdentifier, RuleStatement, Rules};

impl Rules {
    pub fn all_rules() -> [DerivationRule; 18] {
        let ax = DerivationRule {
            name: Rules::Ax,
            premises: vec![],
            conclusion: RuleStatement {
                lhs: Some(RuleIdentifier::Formula(0)),
                formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
            },
        };

        let impl_intro = DerivationRule {
            name: Rules::ImplIntro,
            premises: vec![RuleStatement {
                lhs: Some(RuleIdentifier::Formula(0)),
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Imp {
                    lhs: RuleIdentifier::Formula(0),
                    rhs: RuleIdentifier::Formula(1),
                },
            },
        };

        let impl_elim = DerivationRule {
            name: Rules::ImplElim,
            premises: vec![
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Imp {
                        lhs: RuleIdentifier::Formula(0),
                        rhs: RuleIdentifier::Formula(1),
                    },
                },
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
                },
            ],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            },
        };

        let false_intro = DerivationRule {
            name: Rules::FalseElim,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::False,
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
            },
        };

        let not_intro = DerivationRule {
            name: Rules::NotIntro,
            premises: vec![RuleStatement {
                lhs: Some(RuleIdentifier::Formula(0)),
                formula: RuleFormula::False,
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Not(RuleIdentifier::Formula(0)),
            },
        };

        let not_elim = DerivationRule {
            name: Rules::NotElim,
            premises: vec![
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Not(RuleIdentifier::Formula(0)),
                },
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
                },
            ],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            },
        };

        let and_intro = DerivationRule {
            name: Rules::AndIntro,
            premises: vec![
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
                },
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
                },
            ],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::And {
                    lhs: RuleIdentifier::Formula(0),
                    rhs: RuleIdentifier::Formula(1),
                },
            },
        };

        let and_elim_l = DerivationRule {
            name: Rules::AndElimL,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::And {
                    lhs: RuleIdentifier::Formula(0),
                    rhs: RuleIdentifier::Formula(1),
                },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
            },
        };

        let and_elim_r = DerivationRule {
            name: Rules::AndElimR,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::And {
                    lhs: RuleIdentifier::Formula(0),
                    rhs: RuleIdentifier::Formula(1),
                },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            },
        };

        let or_intro_l = DerivationRule {
            name: Rules::OrIntroL,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Or {
                    lhs: RuleIdentifier::Formula(0),
                    rhs: RuleIdentifier::Formula(1),
                },
            },
        };

        let or_intro_r = DerivationRule {
            name: Rules::OrIntroR,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Or {
                    lhs: RuleIdentifier::Formula(0),
                    rhs: RuleIdentifier::Formula(1),
                },
            },
        };

        let or_elim = DerivationRule {
            name: Rules::OrElim,
            premises: vec![
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Or {
                        lhs: RuleIdentifier::Formula(0),
                        rhs: RuleIdentifier::Formula(1),
                    },
                },
                RuleStatement {
                    lhs: Some(RuleIdentifier::Formula(0)),
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(2)),
                },
                RuleStatement {
                    lhs: Some(RuleIdentifier::Formula(1)),
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(2)),
                },
            ],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(2)),
            },
        };

        let forall_intro = DerivationRule {
            name: Rules::ForallIntro,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(0)),
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Forall {
                    identifier: RuleIdentifier::Element("x".to_string()),
                    formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                },
            },
        };

        let forall_elim = DerivationRule {
            name: Rules::ForallElim,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Forall {
                    identifier: RuleIdentifier::Element("x".to_string()),
                    formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Substitution {
                    identifier: RuleIdentifier::Formula(0),
                    lhs: RuleIdentifier::Element("x".to_string()),
                    rhs: RuleIdentifier::Element("t".to_string()),
                },
            },
        };

        let exists_intro = DerivationRule {
            name: Rules::ExistsIntro,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Substitution {
                    identifier: RuleIdentifier::Formula(0),
                    lhs: RuleIdentifier::Element("x".to_string()),
                    rhs: RuleIdentifier::Element("t".to_string()),
                },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Exists {
                    identifier: RuleIdentifier::Element("x".to_string()),
                    formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                },
            },
        };

        let exists_elim = DerivationRule {
            name: Rules::ExistsElim,
            premises: vec![
                RuleStatement {
                    lhs: None,
                    formula: RuleFormula::Exists {
                        identifier: RuleIdentifier::Element("x".to_string()),
                        formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                    },
                },
                RuleStatement {
                    lhs: Some(RuleIdentifier::Formula(0)),
                    formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
                },
            ],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Ident(RuleIdentifier::Formula(1)),
            },
        };

        let alpha_forall = DerivationRule {
            name: Rules::AlphaForall,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Forall {
                    identifier: RuleIdentifier::Element("y".to_string()),
                    formula: Box::new(RuleFormula::Substitution {
                        identifier: RuleIdentifier::Formula(0),
                        lhs: RuleIdentifier::Element("x".to_string()),
                        rhs: RuleIdentifier::Element("y".to_string()),
                    }),
                },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Forall {
                    identifier: RuleIdentifier::Element("x".to_string()),
                    formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                },
            },
        };
        let alpha_exists = DerivationRule {
            name: Rules::AlphaExists,
            premises: vec![RuleStatement {
                lhs: None,
                formula: RuleFormula::Exists {
                    identifier: RuleIdentifier::Element("y".to_string()),
                    formula: Box::new(RuleFormula::Substitution {
                        identifier: RuleIdentifier::Formula(0),
                        lhs: RuleIdentifier::Element("x".to_string()),
                        rhs: RuleIdentifier::Element("y".to_string()),
                    }),
                },
            }],
            conclusion: RuleStatement {
                lhs: None,
                formula: RuleFormula::Exists {
                    identifier: RuleIdentifier::Element("x".to_string()),
                    formula: Box::new(RuleFormula::Ident(RuleIdentifier::Formula(0))),
                },
            },
        };

        [
            ax,
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
            forall_intro,
            forall_elim,
            exists_intro,
            exists_elim,
            alpha_forall,
            alpha_exists,
        ]
    }
    pub fn get_rule(&self) -> DerivationRule {
        let all_rules = Rules::all_rules();

        all_rules
            .into_iter()
            .find(|rule| rule.name == *self)
            .unwrap()
    }
}
