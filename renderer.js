const chatHistory = document.getElementById('chat-history');
const errorMessage = document.getElementById('error-message');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const youraiStatusDiv = document.getElementById('yourai-status');
const startYouraiBtn = document.getElementById('start-yourai-btn');
const downloadYouraiLink = document.getElementById('download-yourai-link');
const cancelBtn = document.getElementById('cancel-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const saveChatBtn = document.getElementById('save-chat-btn');
const modelSelect = document.getElementById('model-select');

let currentAbortController = null;
let currentConversation = [];
let currentStreamingBubble = null;

// Ultra-fast bubble creation
function appendBubble(sender, text) {
  const row = document.createElement('div');
  row.className = 'bubble-row';
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar ' + (sender === 'You' ? 'avatar-user' : 'avatar-ai');
  avatar.textContent = sender === 'You' ? 'You' : 'AI';
  
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
  return bubble;
}

// Create streaming bubble for real-time text
function createStreamingBubble() {
  const row = document.createElement('div');
  row.className = 'bubble-row';
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar avatar-ai';
  avatar.textContent = 'AI';
  
  const bubble = document.createElement('div');
  bubble.className = 'bubble-ai';
  bubble.textContent = '';
  
  row.appendChild(avatar);
  row.appendChild(bubble);
  chatHistory.appendChild(row);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  
  return bubble;
}

// Fast typing indicator
function createTypingIndicator() {
  const row = document.createElement('div');
  row.className = 'bubble-row';
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar avatar-ai';
  avatar.textContent = 'AI';
  
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  
  row.appendChild(avatar);
  row.appendChild(indicator);
  chatHistory.appendChild(row);
  chatHistory.scrollTop = chatHistory.scrollHeight;
  return indicator;
}

// Remove typing indicator
function removeTypingIndicator() {
  const indicators = chatHistory.querySelectorAll('.typing-indicator');
  indicators.forEach(indicator => {
    const row = indicator.closest('.bubble-row');
    if (row) row.remove();
  });
}

// Fast save conversation
async function saveConversation() {
  try {
    const filename = await window.electronAPI.saveConversation();
    errorMessage.textContent = `Saved as ${filename}`;
    setTimeout(() => {
      errorMessage.textContent = '';
    }, 1500);
  } catch (error) {
    errorMessage.textContent = 'Failed to save';
  }
}

// Fast clear conversation
async function clearConversation() {
  if (confirm('Start new chat?')) {
    await window.electronAPI.clearConversation();
    chatHistory.innerHTML = '';
    currentConversation = [];
    appendBubble('AI', "Hi! I'm YourAI. How can I help you today?");
  }
}

// Comprehensive status check
async function updateYouraiStatus() {
  try {
    const ollamaRunning = await window.electronAPI.ollamaStatus();
    const modelAvailable = await window.electronAPI.checkModel();
    
    if (ollamaRunning && modelAvailable) {
      youraiStatusDiv.textContent = 'Ready to chat!';
      youraiStatusDiv.style.color = '#2d8cff';
      startYouraiBtn.style.display = 'none';
      downloadYouraiLink.style.display = 'none';
      userInput.disabled = false;
      sendBtn.disabled = false;
      newChatBtn.disabled = false;
      saveChatBtn.disabled = false;
    } else if (ollamaRunning && !modelAvailable) {
      youraiStatusDiv.textContent = 'Ollama running but model not found. Run: ollama pull llama3.2:latest';
      youraiStatusDiv.style.color = '#ffa500';
      startYouraiBtn.style.display = 'none';
      downloadYouraiLink.style.display = '';
      userInput.disabled = true;
      sendBtn.disabled = true;
      newChatBtn.disabled = true;
      saveChatBtn.disabled = true;
    } else {
      youraiStatusDiv.textContent = 'Ollama not running. Click "Start YourAI" to begin.';
      youraiStatusDiv.style.color = '#ff6b6b';
      startYouraiBtn.style.display = '';
      userInput.disabled = true;
      sendBtn.disabled = true;
      newChatBtn.disabled = true;
      saveChatBtn.disabled = true;
      downloadYouraiLink.style.display = '';
    }
  } catch (error) {
    youraiStatusDiv.textContent = 'Error checking status. Please restart the app.';
    youraiStatusDiv.style.color = '#ff6b6b';
  }
}

// Setup streaming event listeners
function setupStreamingEvents() {
  // When streaming starts, remove typing indicator and create streaming bubble
  window.electronAPI.onStreamingStart(() => {
    removeTypingIndicator();
    currentStreamingBubble = createStreamingBubble();
  });
  
  // When receiving streaming chunks, append text in real-time
  window.electronAPI.onStreamingChunk((event, chunk) => {
    if (currentStreamingBubble) {
      currentStreamingBubble.textContent += chunk;
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
  });
  
  // When streaming completes, finalize the bubble
  window.electronAPI.onStreamingComplete((event, fullResponse) => {
    if (currentStreamingBubble) {
      currentStreamingBubble.textContent = fullResponse;
      currentStreamingBubble = null;
    }
  });
}

// Ultra-fast send functionality with ChatGPT-like streaming
sendBtn.addEventListener('click', async () => {
  const input = userInput.value.trim();
  if (!input) return;
  
  errorMessage.textContent = '';
  appendBubble('You', input);
  userInput.value = '';
  
  // Show typing indicator
  createTypingIndicator();
  
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
    
    // If no streaming occurred, fall back to regular display
    if (!currentStreamingBubble) {
      removeTypingIndicator();
      if (!cancelled) {
        appendBubble('AI', response);
      }
    }
  } catch (e) {
    removeTypingIndicator();
    
    if (cancelled) {
      appendBubble('AI', '[Cancelled]');
    } else {
      // Show specific error messages
      let errorMsg = 'Error occurred. Please try again.';
      if (typeof e === 'string') {
        if (e.includes('Ollama is not running')) {
          errorMsg = 'Ollama is not running. Please start it first.';
        } else if (e.includes('Model')) {
          errorMsg = 'Model not found. Please run: ollama pull llama3.2:latest';
        } else if (e.includes('timeout')) {
          errorMsg = 'Request timed out. Try a shorter question.';
        } else if (e.includes('Connection error')) {
          errorMsg = 'Connection error. Check if Ollama is running.';
        } else if (e.includes('No response received')) {
          errorMsg = 'No response received. Please try again.';
        } else {
          errorMsg = e;
        }
      }
      appendBubble('AI', errorMsg);
    }
  }
  
  userInput.disabled = false;
  sendBtn.disabled = false;
  cancelBtn.style.display = 'none';
  currentAbortController = null;
});

// Event listeners
cancelBtn.addEventListener('click', () => {
  if (currentAbortController) {
    currentAbortController.abort();
  }
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

newChatBtn.addEventListener('click', clearConversation);
saveChatBtn.addEventListener('click', saveConversation);

// Model switching
modelSelect.addEventListener('change', async (e) => {
  const newModel = e.target.value;
  try {
    await window.electronAPI.setModel(newModel);
    errorMessage.textContent = `Switched to ${newModel}`;
    setTimeout(() => {
      errorMessage.textContent = '';
    }, 2000);
  } catch (error) {
    errorMessage.textContent = 'Failed to switch model';
  }
});

startYouraiBtn.addEventListener('click', async () => {
  youraiStatusDiv.textContent = 'Starting Ollama...';
  youraiStatusDiv.style.color = '#ffa500';
  startYouraiBtn.disabled = true;
  
  try {
    const started = await window.electronAPI.ollamaStart();
    startYouraiBtn.disabled = false;
    await updateYouraiStatus();
    
    if (!started) {
      youraiStatusDiv.textContent = 'Could not start Ollama automatically. Please install it manually.';
      youraiStatusDiv.style.color = '#ff6b6b';
    }
  } catch (error) {
    startYouraiBtn.disabled = false;
    youraiStatusDiv.textContent = 'Error starting Ollama. Please check installation.';
    youraiStatusDiv.style.color = '#ff6b6b';
  }
});

// Initialize app with comprehensive setup
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Show loading status
    youraiStatusDiv.textContent = 'Checking system...';
    youraiStatusDiv.style.color = '#ffa500';
    
    // Setup streaming events for ChatGPT-like experience
    setupStreamingEvents();
    
    // Initialize model selector
    try {
      const currentModel = await window.electronAPI.getCurrentModel();
      modelSelect.value = currentModel;
    } catch (error) {
      console.error('Failed to get current model:', error);
    }
    
    await updateYouraiStatus();
    
    if (chatHistory.childElementCount === 0) {
      appendBubble('AI', "Hi! I'm YourAI. How can I help you today?");
    }
    
    // Auto-refresh status every 30 seconds
    setInterval(updateYouraiStatus, 30000);
  } catch (error) {
    console.error('Failed to initialize app:', error);
    youraiStatusDiv.textContent = 'Failed to initialize. Please restart the app.';
    youraiStatusDiv.style.color = '#ff6b6b';
  }
}); 