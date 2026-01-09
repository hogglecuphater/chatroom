use std::{sync::Arc, time::{self, Duration, Instant}};

use axum::{Json, extract::{Path, State}};

use crate::AppState;

pub struct UserData {
    pub name: String,
    pub last_ping: std::time::Instant,
}

pub async fn handle_register(
    State(state): State<Arc<AppState>>,
    Path(name): Path<String>,
) -> Json<u32> {
    let mut users = state.users.lock().unwrap();

    let id = state.next_user_id.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
    
    users.insert(id, UserData { name: name.clone(), last_ping: time::Instant::now() });

    println!("Register: Added User {name} with id {id}");

    Json(id)
}

pub async fn handle_get_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> Json<Result<String, ()>> {
    let mut users = state.users.lock().unwrap();

    let idnum = match id.parse::<u32>() {
        Ok(num) => num,
        Err(_) => return Json(Err(())),
    };

    let userdata = users.get_mut(&idnum);
    
    let name = match userdata {
        Some(data) => {
            data.last_ping = Instant::now();
            Ok(data.name.clone())
        }
        None => Err(()),
    };

    Json(name)
}

pub async fn start_reaper(state: Arc<AppState>) {
    let mut interval = tokio::time::interval(Duration::from_secs(5)); // Run check every 5 seconds

    loop {
        interval.tick().await;
        
        // 1. Lock the users map
        let mut users = state.users.lock().unwrap();
        let now = Instant::now();
        let timeout = Duration::from_secs(15);

        // 2. Remove users who haven't pinged in 15 seconds
        // retain() is the most efficient way to filter a HashMap in place
        users.retain(|id, user_data| {
            let is_alive = now.duration_since(user_data.last_ping) < timeout;
            
            if !is_alive {
                println!("Reaper: Removing user {} (ID: {}) due to inactivity.", user_data.name, id);
            }
            
            is_alive // Keep if true, delete if false
        });
    }
}