use axum::extract::{Path, State};
use axum::Json;
use log::info;
use sea_orm::{ActiveModelTrait, QueryFilter};
use std::collections::BTreeMap;
use uuid::Uuid;

use crate::db::*;
use crate::error::{BackendError, BackendResult};
use crate::AppState;
use sea_orm::EntityTrait;

use super::exercise_models::{CreateExerciseRequest, Exercise};
use super::formula_models::{Formula, ParseParams, Statement};
use super::models::ApplyRuleParams;
use super::rule_models::{DerivationRule, RuleIdentifier, Rules};
use super::utils::apply_rule as utils_apply_rule;
use crate::lib::{is_tautology, LogicParser};
use sea_orm::ColumnTrait;

#[utoipa::path(
    get,
    path = "/api/exercise",
    responses(
        (status = StatusCode::OK, body = Vec<Exercise>),
        (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
    )
)]
pub async fn get_exercises(state: State<AppState>) -> BackendResult<Json<Vec<Exercise>>> {
    let exercises = exercise::Entity::find().all(&state.db).await?;
    info!("{:?}", exercises);

    let mut result = Vec::new();
    for e in exercises.iter() {
        let exercise = statement::Entity::find_by_id(e.statement_id)
            .one(&state.db)
            .await?;
        if exercise.is_none() {
            continue;
        }
        let exercise = exercise.unwrap();
        let formula = LogicParser::parse_input(&exercise.rhs);
        if let Err(err) = formula {
            print!("error while parseing rhs\n: {:?}", err);
            continue;
        }
        let lhs = exercise.lhs.split(':').collect::<Vec<&str>>();

        let lhs = lhs
            .iter()
            .map(|l| {
                let formula = LogicParser::parse_input(l);
                if formula.is_err() {
                    return None;
                }
                Some(formula.unwrap())
            })
            .collect::<Option<Vec<Formula>>>();

        if lhs.is_none() {
            result.push(Exercise {
                id: e.id,
                likes: e.likes,
                dislikes: e.dislikes,
                exercise: Statement {
                    lhs: vec![],
                    formula: formula.unwrap(),
                },
            });
            continue;
        }

        result.push(Exercise {
            id: e.id,
            likes: e.likes,
            dislikes: e.dislikes,
            exercise: Statement {
                lhs: lhs.unwrap(),
                formula: formula.unwrap(),
            },
        });
    }
    // let input = "(a and b) -> b";
    // let input = "(not r(k)) -> ( ( r(k) or (exists_y (q(y)))) -> (forall_x (not q(x))))";
    // let input = "(forall_y ((exists_x (p(x,y))) -> (not q(y)))) -> (q(z) -> (not p(z,z)))";
    // let input = "p(a,b)";
    // let input = "(exists_x (p(x,x))) -> (p(a,b))";
    // let input = "(forall_x (forall_y (p(x,y)))) -> (forall_b (forall_a (p(a,b))))";
    // let input = "(exists_x (p and q)) -> (exists_x (p))";

    // let f = LogicParser::parse_input(input).unwrap();
    Ok(Json(result))
}

#[utoipa::path(
    get,
    path = "/api/exercise/{id}",
    responses(
        (status = StatusCode::OK, body = Statement),
        (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
    )
)]
pub async fn get_exercise(
    state: State<AppState>,
    Path(id): Path<Uuid>,
) -> BackendResult<Json<Statement>> {
    let exercises = exercise::Entity::find_by_id(id).one(&state.db).await?;

    if exercises.is_none() {
        return Err(BackendError::NotFound {
            entity: "Exercise".to_string(),
        });
    }

    let statement = statement::Entity::find_by_id(exercises.unwrap().statement_id)
        .one(&state.db)
        .await?;

    if statement.is_none() {
        return Err(BackendError::NotFound {
            entity: "Statement".to_string(),
        });
    }

    let statement = statement.unwrap();
    let rhs = LogicParser::parse_input(&statement.rhs);
    if let Err(err) = rhs {
        return Err(BackendError::BadRequest(err));
    }

    if statement.lhs.is_empty() {
        Ok(Json(Statement {
            lhs: vec![],
            formula: rhs.unwrap(),
        }))
    } else {
        let lhs = statement.lhs.split(':').collect::<Vec<&str>>();

        let lhs = lhs
            .iter()
            .map(|l| {
                let formula = LogicParser::parse_input(l);
                if formula.is_err() {
                    return None;
                }
                Some(formula.unwrap())
            })
            .collect::<Option<Vec<Formula>>>();

        if lhs.is_none() {
            return Err(BackendError::BadRequest(
                "Error while parsing lhs".to_string(),
            ));
        }

        Ok(Json(Statement {
            lhs: lhs.unwrap(),
            formula: rhs.unwrap(),
        }))
    }

    // let result = exercises.iter().filter_map(|e| {
    //     let formula = LogicParser::parse_input(&e.rhs);
    //     if formula.is_err() {
    //         return None;
    //     }
    //     let lhs = e.lhs.split(':').collect::<Vec<&str>>();

    //     let lhs = lhs.iter().map(|l| {
    //         let formula = LogicParser::parse_input(l);
    //         if formula.is_err() {
    //             return None;
    //         }
    //         Some(formula.unwrap())
    //     }).collect::<Option<Vec<Formula>>>();

    //     if lhs.is_none() {
    //         return None;
    //     }

    //     Some(Statement {
    //         lhs: lhs.unwrap(),
    //         formula: formula.unwrap(),
    //     })
    // }).collect::<Vec<_>>();

    // let input = "(a and b) -> b";
    // let input = "(not r(k)) -> ( ( r(k) or (exists_y (q(y)))) -> (forall_x (not q(x))))";
    // let input = "(forall_y ((exists_x (p(x,y))) -> (not q(y)))) -> (q(z) -> (not p(z,z)))";
    // let input = "p(a,b)";
    // let input = "(exists_x (p(x,x))) -> (p(a,b))";
    // let input = "(forall_x (forall_y (p(x,y)))) -> (forall_b (forall_a (p(a,b))))";
    // let input = "(exists_x (p and q)) -> (exists_x (p))";

    // let f = LogicParser::parse_input(input).unwrap();
    // Ok(Json(result[0].clone()))
}

#[utoipa::path(
    post,
    path = "/api/exercise",
    responses(
        (status = StatusCode::OK, body = bool),
        (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
    )
)]
pub async fn create_exercise(
    state: State<AppState>,
    query: Json<CreateExerciseRequest>,
) -> BackendResult<Json<bool>> {
    let res = is_tautology(Statement {
        lhs: query.lhs.clone(),
        formula: query.rhs.clone(),
    });

    if !res {
        return Err(BackendError::BadRequest(
            "The formula is not a tautology".to_string(),
        ));
    }

    let rhs = query.rhs.to_string();
    let mut lhs_sorted = query.lhs.clone();
    lhs_sorted.sort();
    let lhs = lhs_sorted
        .iter()
        .map(|l| l.to_string())
        .collect::<Vec<String>>()
        .join(":");

    let exists = statement::Entity::find()
        .filter(statement::Column::Lhs.eq(&lhs))
        .filter(statement::Column::Rhs.eq(&rhs))
        .one(&state.db)
        .await?;

    let exercise = if let Some(stmt) = exists {
        let ex = exercise::Entity::find()
            .filter(exercise::Column::StatementId.eq(stmt.id))
            .one(&state.db)
            .await?;
        match ex {
            Some(_) => {
                return Err(BackendError::BadRequest(
                    "This exercise already exists".to_string(),
                ))
            }
            None => exercise::ActiveModel {
                dislikes: sea_orm::ActiveValue::Set(0),
                likes: sea_orm::ActiveValue::Set(0),
                statement_id: sea_orm::ActiveValue::Set(stmt.id),
                ..Default::default()
            },
        }
    } else {
        let node = statement::ActiveModel {
            lhs: sea_orm::ActiveValue::Set(lhs),
            rhs: sea_orm::ActiveValue::Set(rhs),
            ..Default::default()
        };

        let statement = node.save(&state.db).await?;

        exercise::ActiveModel {
            dislikes: sea_orm::ActiveValue::Set(0),
            likes: sea_orm::ActiveValue::Set(0),
            statement_id: statement.id,
            ..Default::default()
        }
    };
    let _ = exercise.save(&state.db).await?;

    Ok(Json(true))
}

#[utoipa::path(
    post,
    path = "/api/parse",
    responses(
        (status = StatusCode::OK, body = Formula),
        (status = StatusCode::NOT_FOUND, description = "Building not found"),
        (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
    )
)]
pub async fn parse(query: Json<ParseParams>) -> BackendResult<Json<Formula>> {
    let f = LogicParser::parse_input(&query.formula);
    match f {
        Ok(formula) => Ok(Json(formula)),
        Err(err) => Err(BackendError::BadRequest(err)),
    }
}

#[utoipa::path(
    get,
    path = "/api/rules",
    responses(
        (status = StatusCode::OK, body = Vec<DerivationRule>),
        (status = StatusCode::NOT_FOUND, description = "Building not found"),
        (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
    )
)]
pub async fn all_rules() -> BackendResult<Json<Vec<DerivationRule>>> {
    let rules = Rules::all_rules();
    Ok(Json(rules.into_iter().collect::<Vec<_>>()))
}

#[utoipa::path(
    post,
    path = "/api/apply",
    responses(
        (status = StatusCode::OK, body = Vec<Statement>),
        (status = StatusCode::NOT_FOUND, description = "Building not found"),
        (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
    )
)]
pub async fn apply_rule(query: Json<ApplyRuleParams>) -> BackendResult<Json<Vec<Statement>>> {
    let rule = query.rule.get_rule();

    let mut formula_mapping = query
        .mapping
        .clone()
        .into_iter()
        .map(|map| (RuleIdentifier::Formula(map.from), map.to))
        .collect::<BTreeMap<RuleIdentifier, Formula>>();

    let mut element_mapping = query
        .substitution
        .clone()
        .into_iter()
        .map(|map| (RuleIdentifier::Element(map.from), map.to))
        .collect::<BTreeMap<RuleIdentifier, String>>();

    let new_premisses = utils_apply_rule(
        query.statement.clone(),
        rule,
        &mut formula_mapping,
        &mut element_mapping,
    )?;
    Ok(Json(new_premisses))
}

#[utoipa::path(
    post,
    path = "/api/check",
    responses(
        (status = StatusCode::OK, body = bool),
        (status = StatusCode::NOT_FOUND, description = "Building not found"),
        (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
    )
)]
pub async fn check(query: Json<Statement>) -> BackendResult<Json<bool>> {
    let result = is_tautology(query.0.clone());
    info!("{:?} is a tautology: {}", query.0, result);
    Ok(Json(result))
}

// #[utoipa::path(
//     post,
//     path = "/api/tree",
//     responses(
//         (status = StatusCode::OK, body = bool),
//         (status = StatusCode::NOT_FOUND, description = "Building not found"),
//         (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
//     )
// )]
// pub async fn add_tree(query: Json<CreateTreeRequest>) -> BackendResult<Json<bool>> {

//     let check_tree = check_tree(query.root_id, query.nodes.clone());

//     if !check_tree {
//         return Err(BackendError::BadRequest("The tree is not valid".to_string()));
//     }

//     Ok(Json(true))
// }
