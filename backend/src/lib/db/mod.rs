mod utils;
use crate::db::node;
use crate::db::statement;
use sea_orm::{ActiveModelTrait, ColumnTrait, Condition, IntoActiveModel};
use sea_orm::{ConnectionTrait, EntityTrait, QueryFilter};
use uuid::Uuid;

use crate::api::models::Node;
use crate::error::{BackendError, BackendResult};

pub async fn add_tree(
    trx: &impl ConnectionTrait,
    root_id: Uuid,
    nodes: &Vec<Node>,
) -> BackendResult<()> {
    let node = nodes.iter().find(|n| n.name == root_id).unwrap();

    let lhs = serde_json::to_string(&node.statement.lhs)
        .map_err(|e| BackendError::BadRequest(format!("failed to serialize: {e}")))?;
    let rhs = serde_json::to_string(&node.statement.formula)
        .map_err(|e| BackendError::BadRequest(format!("failed to serialize: {e}")))?;

    let statement = statement::Entity::find()
        .filter(
            Condition::all()
                .add(statement::Column::Lhs.eq(&lhs))
                .add(statement::Column::Rhs.eq(&rhs)),
        )
        .one(trx)
        .await?;

    let statement_id = match statement {
        Some(s) => s.id,
        None => {
            let statement = statement::ActiveModel {
                lhs: sea_orm::ActiveValue::Set(lhs),
                rhs: sea_orm::ActiveValue::Set(rhs),
                ..Default::default()
            };
            let added = statement.save(trx).await?;
            let res = added.id.unwrap();
            res
        }
    };

    let node = node::Entity::find()
        .filter(
            Condition::all().add(
                node::Column::ChildId
                    .eq(statement_id)
                    .add(node::Column::Rule.ne(node.rule)),
            ),
        )
        .all(trx)
        .await?;

    Ok(())
}
