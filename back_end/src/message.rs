use std::{sync::Arc};

use axum::{Json, extract::{State}, http::StatusCode};
use serde::{Deserialize, Serialize};

use crate::{AppState};

#[derive(Deserialize, Debug, Serialize, Clone)]
pub struct Message {
    id: u32,
    sender: u32,
    content: String,
}

#[derive(Deserialize, Debug, Serialize, Clone)]
pub struct MessageInput {
    userid: u32,
    content: String,
}

#[derive(Deserialize, Debug, Serialize, Clone)]
pub struct MessageOutput {
    id: u32,
    sender: u32,
    sender_name: String,
    content: String,
}

pub async fn handle_send_message(
    State(state): State<Arc<AppState>>,
    Json(message): Json<MessageInput>,
) -> axum::http::StatusCode {
    let mut messages = state.messages.lock().unwrap();

    let id = state.next_message_id.fetch_add(1, std::sync::atomic::Ordering::Relaxed);

    println!("Message: Recieved message '{}' from {}", message.content, message.userid);

    messages.push(Message { id, sender: message.userid, content: message.content });

    StatusCode::OK
}

pub async fn handle_get_messages(
    State(state): State<Arc<AppState>>,
) -> Json<Vec<MessageOutput>> {
    let messages = state.messages.lock().unwrap();
    let users = state.users.lock().unwrap();

    let start_index = messages.len().saturating_sub(20);
    
    let output: Vec<MessageOutput> = messages[start_index..]
        .iter()
        .map(|m| {
            let sender_name = users.get(&m.sender)
                .map(|u| u.name.clone())
                .unwrap_or_else(|| format!("Guest{}", m.sender));

            MessageOutput {
                id: m.id,
                sender: m.sender,
                sender_name,
                content: m.content.clone(),
            }
        })
        .collect();

    Json(output)
}