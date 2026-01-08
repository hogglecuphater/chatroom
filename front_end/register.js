const inputForm = document.getElementById("inputForm");
const nameInput = document.getElementById("nameInput");
const submitButton = document.getElementById("submitButton");
const passwordInput = document.getElementById("passwordInput");

passwordInput.style.display = 'none';

// const apiLocation = 'https://chatroom-api.hogglecuphater.org'
const apiLocation = 'http://127.0.0.1:8001'

inputForm.addEventListener('submit', inputFormSubmitHandler);
async function inputFormSubmitHandler(event) {
    event.preventDefault();

    try {
        const res = await fetch(`${apiLocation}/register/${nameInput.value}`, {
            method: 'POST',
        });

        if (!res.ok) {
            throw new Error(`Server responded with ${res.status}`);
        }

        let id = await res.json();

        sessionStorage.setItem('chat_user_id', id.toString());
        window.location.href = 'mainroom.html';

    } catch (error) {
        console.error("Redirect failed because of a fetch error:", error);
        alert("Could not register user. Is the server running?");
    }
}