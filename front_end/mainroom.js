const messageContainer = document.getElementById("messageContainer");
const messages = document.getElementById("messages");
const messageSendForm = document.getElementById("messageSendForm");
const messageInput = document.getElementById("messageInput");

// Api
// const apiLocation = 'https://chatroom-api.hogglecuphater.org'
const apiLocation = 'http://127.0.0.1:8001'

// User Data
const id = Number(sessionStorage.getItem('chat_user_id'));
sessionStorage.removeItem('chat_user_id');
let username;

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

    entry.textContent = `[${name}] ${message}`;

    messages.appendChild(entry);
    
    if (isAtBottom) {
        messages.scrollTop = messages.scrollHeight;
    }
}

messageSendForm.addEventListener('submit', messageSendFormSubmitHandler)
function messageSendFormSubmitHandler(event) {
    event.preventDefault();

    if (messageInput.value.trim()) {
        addMessage(username, messageInput.value);

        messageInput.value = '';
        messageInput.focus();
    }
}

setInterval(getName, 1000);