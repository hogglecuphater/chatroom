const messageContainer = document.getElementById("messageContainer");
const messages = document.getElementById("messages");
const messageSendForm = document.getElementById("messageSendForm");
const messageInput = document.getElementById("messageInput");

// Api
const apiLocation = 'https://chatroom-api.hogglecuphater.org'
// const apiLocation = 'http://127.0.0.1:8001'

// User Data
const id = Number(sessionStorage.getItem('chat_user_id'));
sessionStorage.removeItem('chat_user_id');
let username;

let seenMessageIds = [0];

async function getName() {
    if (!id) {
        window.location.href = 'register.html';
        return;
    }

    try {
        const res = await fetch(`${apiLocation}/get_id/${id}`);

        if (!res.ok) {
            console.error(`Server error: ${res.status} ${res.statusText}`);
            throw new Error("Failed to fetch name");
        }

        const data = await res.json(); 
        
        if (data && "Ok" in data) {
            username = data.Ok;
        } else {
            window.location.href = 'register.html';
        }
    }
    catch (err) {
        console.error("Error in getName:", err);
        window.location.href = 'register.html'; // Comment this out while debugging!
    }
}

function addMessage(name, message) {
    const isAtBottom = messageContainer.scrollHeight - messageContainer.clientHeight <= messageContainer.scrollTop + 15;

    const entry = document.createElement('div');
    entry.className = 'log-entry';

    entry.textContent = `${name}: ${message}`;

    messages.appendChild(entry);
    
    if (isAtBottom) {
        messages.scrollTop = messages.scrollHeight;
    }
}

async function sendMessage(contents) {
    try {
        const payload = {
            userid: id,
            content: contents,
        };

        const res = await fetch(`${apiLocation}/send_message/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error(`Failed to send: ${res.status} ${res.statusText}`);
            throw new Error("Failed to send message");
        }
    }
    catch {
        addMessage("System", 'Failed to send your message');
    }
}

async function getMessages() {
    try {
        const res = await fetch(`${apiLocation}/get_messages`);

        if (!res.ok) {
            console.error(`Failed to get messages: ${res.status} ${res.statusText}`);
            throw new Error("Failed to get message");
        }

        let messages = await res.json();

        messages.forEach(msg => {
            if (!seenMessageIds.includes(msg.id)) {
                addMessage(msg.sender_name, msg.content);
                seenMessageIds.push(msg.id)
            }
        });
    }
    catch {

    }
}

messageSendForm.addEventListener('submit', messageSendFormSubmitHandler)
function messageSendFormSubmitHandler(event) {
    event.preventDefault();

    if (messageInput.value.trim()) {
        sendMessage(messageInput.value);

        messageInput.value = '';
        messageInput.focus();
    }
}

setInterval(getName, 1000);
setInterval(getMessages, 750)