use log::{error, info};
use sea_orm::{ConnectOptions, Database, DatabaseConnection};
use std::{
    thread,
    time::{self, Duration},
};

pub async fn connect_db() -> Result<DatabaseConnection, String> {
    let url = match std::env::var("POSTGRES_URL") {
        Ok(var) => var,
        Err(_) => return Err(String::from("POSTGRES_URL must be set")),
    };

    // Connect to the database. Wait and retry if the database is not ready yet.

    let second = time::Duration::from_secs(5);
    let mut options = ConnectOptions::new(&url);
    options
        .connect_timeout(Duration::from_secs(10))
        .idle_timeout(Duration::from_secs(10))
        .acquire_timeout(Duration::from_secs(10))
        .sqlx_logging(true)
        .sqlx_logging_level(log::LevelFilter::Debug);

    loop {
        info!("attempting to connect to database");
        match Database::connect(options.clone()).await {
            Ok(db) => {
                info!("successfully connected to database");
                return Ok(db);
            }
            Err(err) => {
                error!("failed to connect to database: {err}");
                info!("retrying in 5 seconds");
                thread::sleep(second)
            }
        }
    }
}
