use sea_orm::{Database, DatabaseConnection};
use std::{thread, time};

pub async fn connect_db() -> Result<DatabaseConnection, String> {
    let url = std::env::var("POSTGRES_URL").expect("POSTGRES_URL must be set");

    // Connect to the database. Wait and retry if the database is not ready yet.

    let second = time::Duration::from_secs(5);
    loop {
        println!("Try connecting to database");
        let db = Database::connect(&url).await;

        if db.is_ok() {
            println!("Connected to database");
            return Ok(db.unwrap());
        } else {
            println!("Failed to connect to database. Waiting for 5 seconds and retrying");
            thread::sleep(second)
        }
    }
}
