use crate::lib::rule::Rules;
use crate::db::sea_orm_active_enums::Rules as DbRules;






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
            Rules::ForallIntro =>  DbRules::ForallIntro,
            Rules::ExistsElim => DbRules::ExistsElim,
            Rules::ExistsIntro => DbRules::ExistsIntro,
            Rules::AlphaExists => DbRules::AlphaExists,
            Rules::AlphaForall => DbRules::AlphaForall,
        }
    }
}





