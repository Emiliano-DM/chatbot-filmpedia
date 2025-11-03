import { procesarPregunta } from "./chatbot.js";

// Chat functionality
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Add message to chat
function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message bot-message';
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get bot response from Gemini API
async function getBotResponse(userMessage) {
    const respuesta = await procesarPregunta(userMessage);
    return respuesta;
}

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();

    if (message === '') return;

    // Disable input and button to prevent spam
    userInput.disabled = true;
    sendButton.disabled = true;
    sendButton.style.opacity = '0.6';
    sendButton.style.cursor = 'not-allowed';

    // Display user message
    addMessage(message, true);
    userInput.value = '';

    // Show loading message
    addMessage('Buscando recomendaciones...', false);

    try {
        // Get bot response from Gemini API
        const botResponse = await getBotResponse(message);

        // Remove loading message
        const messages = chatMessages.children;
        if (messages.length > 0) {
            chatMessages.removeChild(messages[messages.length - 1]);
        }

        // Display actual response
        addMessage(botResponse, false);
    } catch (error) {
        // Remove loading message
        const messages = chatMessages.children;
        if (messages.length > 0) {
            chatMessages.removeChild(messages[messages.length - 1]);
        }

        // Display error
        addMessage('Lo siento, ocurrió un error. Por favor intenta de nuevo.', false);
        console.error('Error:', error);
    } finally {
        // Re-enable input and button after processing
        userInput.disabled = false;
        sendButton.disabled = false;
        sendButton.style.opacity = '1';
        sendButton.style.cursor = 'pointer';
        userInput.focus();
    }
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
