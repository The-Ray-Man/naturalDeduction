mod utils;
use crate::api::models::Node;
use crate::db::node;
use crate::db::sea_orm_active_enums::Rules as DbRules;
use crate::db::statement;
use crate::error::{BackendError, BackendResult};
use crate::lib::rule::Rules;
use sea_orm::{ActiveModelTrait, ColumnTrait, Condition, IntoActiveModel};
use sea_orm::{ConnectionTrait, EntityTrait, QueryFilter};
use uuid::Uuid;

pub async fn add_tree(
    trx: &impl ConnectionTrait,
    root_id: Uuid,
    nodes: &Vec<Node>,
) -> BackendResult<Uuid> {
    println!("Adding tree with root_id: {}", root_id);
    let node = nodes.iter().find(|n| n.name == root_id).unwrap();

    let lhs = serde_json::to_string(&node.statement.lhs)
        .map_err(|e| BackendError::BadRequest(format!("failed to serialize: {e}")))?;
    let rhs = serde_json::to_string(&node.statement.formula)
        .map_err(|e| BackendError::BadRequest(format!("failed to serialize: {e}")))?;

    let statement = Box::pin(
        statement::Entity::find()
            .filter(
                Condition::all()
                    .add(statement::Column::Lhs.eq(&lhs))
                    .add(statement::Column::Rhs.eq(&rhs)),
            )
            .one(trx),
    )
    .await?;

    let statement_id = match statement {
        Some(s) => s.id,
        None => {
            let statement = statement::ActiveModel {
                lhs: sea_orm::ActiveValue::Set(lhs),
                rhs: sea_orm::ActiveValue::Set(rhs),
                ..Default::default()
            };
            let added = Box::pin(statement.save(trx)).await?;
            let res = added.id.unwrap();
            res
        }
    };

    let already_exists = Box::pin(
        node::Entity::find()
            .filter(
                Condition::all()
                    .add(node::Column::ParentId.eq(statement_id))
                    .add(node::Column::Rule.eq::<DbRules>(node.rule.clone().into())),
            )
            .one(trx),
    )
    .await?;

    match already_exists {
        Some(node) => {
            return Ok(node.parent_id);
        }
        None => {
            if node.rule == Rules::Ax {
                let node = node::ActiveModel {
                    parent_id: sea_orm::ActiveValue::Set(statement_id),
                    rule: sea_orm::ActiveValue::Set(node.rule.clone().into()),
                    ..Default::default()
                };
                let _ = Box::pin(node.save(trx)).await?;
                return Ok(statement_id);
            }

            for (i, child) in node.premisses.clone().into_iter().enumerate() {
                let child_id = Box::pin(add_tree(trx, child, nodes)).await?;

                let node = node::ActiveModel {
                    child_id: sea_orm::ActiveValue::Set(Some(child_id)),
                    parent_id: sea_orm::ActiveValue::Set(statement_id),
                    rule: sea_orm::ActiveValue::Set(node.rule.clone().into()),
                    order: sea_orm::ActiveValue::Set(i as i32),
                    ..Default::default()
                };

                let _ = Box::pin(node.save(trx)).await?;
            }

            Ok(statement_id)
        }
    }
}
