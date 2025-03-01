use crate::db::sea_orm_active_enums::Rules as DbRules;
use crate::lib::rule::Rules;

impl From<Rules> for DbRules {
    fn from(value: Rules) -> Self {
        match value {
            Rules::Ax => DbRules::Ax,
            Rules::ImplIntro => DbRules::ImplIntro,
            Rules::ImplElim => DbRules::ImplElim,
            Rules::FalseElim => DbRules::FalseElim,
            Rules::NotIntro => DbRules::NotIntro,
            Rules::NotElim => DbRules::NotElim,
            Rules::AndIntro => DbRules::AndIntro,
            Rules::AndElimL => DbRules::AndElimL,
            Rules::AndElimR => DbRules::AndElimR,
            Rules::OrIntroL => DbRules::OrIntroL,
            Rules::OrIntroR => DbRules::OrIntroR,
            Rules::OrElim => DbRules::OrElim,
            Rules::ForallElim => DbRules::ForallElim,
            Rules::ForallIntro => DbRules::ForallIntro,
            Rules::ExistsElim => DbRules::ExistsElim,
            Rules::ExistsIntro => DbRules::ExistsIntro,
            Rules::AlphaExists => DbRules::AlphaExists,
            Rules::AlphaForall => DbRules::AlphaForall,
        }
    }
}

impl From<DbRules> for Rules {
    fn from(value: DbRules) -> Self {
        match value {
            DbRules::Ax => Rules::Ax,
            DbRules::ImplIntro => Rules::ImplIntro,
            DbRules::ImplElim => Rules::ImplElim,
            DbRules::FalseElim => Rules::FalseElim,
            DbRules::NotIntro => Rules::NotIntro,
            DbRules::NotElim => Rules::NotElim,
            DbRules::AndIntro => Rules::AndIntro,
            DbRules::AndElimL => Rules::AndElimL,
            DbRules::AndElimR => Rules::AndElimR,
            DbRules::OrIntroL => Rules::OrIntroL,
            DbRules::OrIntroR => Rules::OrIntroR,
            DbRules::OrElim => Rules::OrElim,
            DbRules::ForallElim => Rules::ForallElim,
            DbRules::ForallIntro => Rules::ForallIntro,
            DbRules::ExistsElim => Rules::ExistsElim,
            DbRules::ExistsIntro => Rules::ExistsIntro,
            DbRules::AlphaExists => Rules::AlphaExists,
            DbRules::AlphaForall => Rules::AlphaForall,
        }
    }
}
