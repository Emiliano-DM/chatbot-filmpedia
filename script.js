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

// Mock bot response (placeholder for future Gemini API integration)
function getBotResponse(userMessage) {
    // This function will later call your backend/Gemini API
    // For now, return a mock response
    return 'To-Do: message from gemini';
}

// Send message function 
async function sendMessage() {
    const message = userInput.value.trim();

    if (message === '') return;

    // Display user message
    addMessage(message, true);
    userInput.value = '';

    // Get bot response (currently mock, will be API call later)
    setTimeout(() => {
        const botResponse = getBotResponse(message);
        addMessage(botResponse, false);
    }, 500);
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
