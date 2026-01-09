#![allow(dead_code)]

// Standard
use std::{collections::{HashMap}, sync::{Arc, Mutex, atomic::AtomicU32}};
// Libraries
use axum::{Router, routing::{get, post}};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

// Modules
mod user;
mod message;

struct AppState {
    users: Mutex<HashMap<u32, user::UserData>>,
    next_user_id: AtomicU32,
    messages: Mutex<Vec<message::Message>>,
    next_message_id: AtomicU32,
}

#[tokio::main]
async fn main() {
    let state = Arc::new(AppState {
        users: Mutex::new(HashMap::new()),
        next_user_id: AtomicU32::new(1),
        messages: Mutex::new(Vec::new()),
        next_message_id: AtomicU32::new(1),
    });

    let reaper_state = Arc::clone(&state);
    tokio::spawn(async move {
        user::start_reaper(reaper_state).await;
    });

    let cors = CorsLayer::permissive(); // Allows everything for development
    
    let app = Router::new()
        .route("/register/{name}", post(user::handle_register))
        .route("/get_id/{id}", get(user::handle_get_id))
        .route("/send_message/{id}", post(message::handle_send_message))
        .route("/get_messages", get(message::handle_get_messages))
        .layer(cors)
        .with_state(state);

    let listener = TcpListener::bind("127.0.0.1:8001").await.unwrap();

    axum::serve(listener, app).await.unwrap();
}
