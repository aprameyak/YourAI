const chatHistory = document.getElementById('chat-history');
const errorMessage = document.getElementById('error-message');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const youraiStatusDiv = document.getElementById('yourai-status');
const startYouraiBtn = document.getElementById('start-yourai-btn');
const downloadYouraiLink = document.getElementById('download-yourai-link');
const cancelBtn = document.getElementById('cancel-btn');
let currentAbortController = null;

function appendBubble(sender, text) {
  const row = document.createElement('div');
  row.className = 'bubble-row';
  const avatar = document.createElement('div');
  avatar.className = 'avatar ' + (sender === 'You' ? 'avatar-user' : 'avatar-ai');
  avatar.textContent = sender === 'You' ? 'You' : 'YourAI';
  const bubble = document.createElement('div');
  bubble.className = sender === 'You' ? 'bubble-user' : 'bubble-ai';
  bubble.textContent = text;
  if (sender === 'You') {
    row.appendChild(bubble);
    row.appendChild(avatar);
  } else {
    row.appendChild(avatar);
    row.appendChild(bubble);
  }
  chatHistory.appendChild(row);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function updateYouraiStatus() {
  const running = await window.electronAPI.ollamaStatus();
  if (running) {
    youraiStatusDiv.textContent = 'YourAI is ready to chat!';
    startYouraiBtn.style.display = 'none';
    downloadYouraiLink.style.display = 'none';
    userInput.disabled = false;
    sendBtn.disabled = false;
  } else {
    youraiStatusDiv.textContent = 'YourAI is not running.';
    startYouraiBtn.style.display = '';
    userInput.disabled = true;
    sendBtn.disabled = true;
    downloadYouraiLink.style.display = '';
  }
}

sendBtn.addEventListener('click', async () => {
  const input = userInput.value.trim();
  if (!input) {
    errorMessage.textContent = 'Please enter a message.';
    return;
  }
  errorMessage.textContent = '';
  appendBubble('You', input);
  userInput.value = '';
  appendBubble('AI', '...');
  userInput.disabled = true;
  sendBtn.disabled = true;
  cancelBtn.style.display = '';
  let cancelled = false;
  currentAbortController = new AbortController();
  try {
    const responsePromise = window.electronAPI.ollamaQuery(input);
    const cancelPromise = new Promise((_, reject) => {
      currentAbortController.signal.addEventListener('abort', () => {
        cancelled = true;
        reject('cancelled');
      });
    });
    const response = await Promise.race([responsePromise, cancelPromise]);
    const bubbles = chatHistory.querySelectorAll('.bubble-row');
    if (bubbles.length > 0 && bubbles[bubbles.length - 1].textContent === 'YourAI...') {
      chatHistory.removeChild(bubbles[bubbles.length - 1]);
    }
    appendBubble('AI', response);
  } catch (e) {
    const bubbles = chatHistory.querySelectorAll('.bubble-row');
    if (bubbles.length > 0 && bubbles[bubbles.length - 1].textContent === 'YourAI...') {
      chatHistory.removeChild(bubbles[bubbles.length - 1]);
    }
    if (cancelled) {
      appendBubble('AI', '[Cancelled]');
    } else {
      appendBubble('AI', 'Error occurred');
    }
  }
  userInput.disabled = false;
  sendBtn.disabled = false;
  cancelBtn.style.display = 'none';
  currentAbortController = null;
});

cancelBtn.addEventListener('click', () => {
  if (currentAbortController) {
    currentAbortController.abort();
  }
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});

startYouraiBtn.addEventListener('click', async () => {
  youraiStatusDiv.textContent = 'Attempting to start YourAI...';
  startYouraiBtn.disabled = true;
  const started = await window.electronAPI.ollamaStart();
  startYouraiBtn.disabled = false;
  await updateYouraiStatus();
  if (!started) {
    youraiStatusDiv.textContent = 'Could not start YourAI automatically. Please install or start it manually.';
  }
});

window.addEventListener('DOMContentLoaded', () => {
  updateYouraiStatus();
  if (chatHistory.childElementCount === 0) {
    appendBubble('YourAI', "Hi! I'm YourAI. How can I help you today?");
  }
}); 