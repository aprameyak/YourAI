const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const http = require('http');
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');

// Private data storage - all local, no cloud
const userDataPath = path.join(app.getPath('userData'), 'conversations');
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// Ensure private data directories exist
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('index.html');
  
  // Store window reference for streaming events
  global.mainWindow = win;
  
  return win;
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Ultra-fast conversation storage
let currentConversation = [];
let currentModel = 'llama3.2:latest'; // Dynamic model selection

// Function to change model
function changeModel(newModel) {
  currentModel = newModel;
  return true;
}

// Function to get current model
function getCurrentModel() {
  return currentModel;
}

function checkOllamaStatus() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 11434,
      path: '/api/tags',
      method: 'GET',
      timeout: 500, // Ultra-fast timeout
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

// Check if model is available
function checkModelAvailable(modelName) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 11434,
      path: '/api/tags',
      method: 'GET',
      timeout: 2000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const models = JSON.parse(data).models || [];
          const modelExists = models.some(m => m.name === modelName);
          resolve(modelExists);
        } catch {
          resolve(false);
        }
      });
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

// Save conversation privately
function saveConversation() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `conversation-${timestamp}.json`;
  const filepath = path.join(userDataPath, filename);
  
  const conversationData = {
    id: timestamp,
    model: currentModel,
    messages: currentConversation,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(filepath, JSON.stringify(conversationData, null, 2));
  return filename;
}

// Load conversation from private storage
function loadConversation(filename) {
  const filepath = path.join(userDataPath, filename);
  if (fs.existsSync(filepath)) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    currentConversation = data.messages || [];
    return data;
  }
  return null;
}

// Get all saved conversations
function getSavedConversations() {
  const files = fs.readdirSync(userDataPath).filter(f => f.endsWith('.json'));
  return files.map(filename => {
    const filepath = path.join(userDataPath, filename);
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    return {
      filename,
      title: data.messages[0]?.content?.substring(0, 50) + '...' || 'Untitled',
      model: data.model,
      createdAt: data.createdAt,
      messageCount: data.messages.length
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ULTRA-FAST query with streaming for ChatGPT-like experience
function ollamaQueryWithStreaming(prompt) {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if Ollama is running
      const ollamaRunning = await checkOllamaStatus();
      if (!ollamaRunning) {
        reject('Ollama is not running. Please start Ollama first.');
        return;
      }

      // Check if model is available
      const modelAvailable = await checkModelAvailable(currentModel);
      if (!modelAvailable) {
        reject(`Model '${currentModel}' is not available. Please run: ollama pull ${currentModel}`);
        return;
      }

      // Add user message to conversation
      currentConversation.push({ role: 'user', content: prompt });
      
      // Use only last 2 messages for ultra speed
      const contextMessages = currentConversation.slice(-2);
      const systemPrompt = `You are a helpful, intelligent AI assistant. Be smart, understanding, and helpful. 

Key guidelines:
- Understand context and intent, even with typos or unclear phrasing
- Provide accurate, helpful responses
- Be concise but thorough
- If something is unclear, ask for clarification politely
- Use common sense and reasoning
- Be friendly and professional`;
      
      const messages = [
        { role: 'system', content: systemPrompt },
        ...contextMessages
      ];
      
      const data = JSON.stringify({ 
        model: currentModel,
        messages: messages,
        stream: true,
        options: {
          temperature: 0.5,
          top_p: 0.8,
          max_tokens: 512,
          num_predict: 256,
          top_k: 20,
          repeat_penalty: 1.1
        }
      });
      
      const req = http.request({
        hostname: 'localhost',
        port: 11434,
        path: '/api/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
        timeout: 30000, // 30 second timeout
      }, (res) => {
        let fullResponse = '';
        let buffer = '';
        let isFirstChunk = true;
        
        res.on('data', (chunk) => {
          buffer += chunk.toString();
          let lines = buffer.split('\n');
          buffer = lines.pop();
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const obj = JSON.parse(line);
                if (obj.message?.content) {
                  const content = obj.message.content;
                  fullResponse += content;
                  
                  // Emit streaming event for real-time updates
                  if (isFirstChunk) {
                    // Remove typing indicator and start streaming
                    global.mainWindow?.webContents?.send('streaming-start');
                    isFirstChunk = false;
                  }
                  
                  // Send each chunk for real-time display
                  global.mainWindow?.webContents?.send('streaming-chunk', content);
                }
              } catch (parseError) {
                console.error('Error parsing streaming response:', parseError);
              }
            }
          }
        });
        
        res.on('end', () => {
          if (fullResponse) {
            currentConversation.push({ role: 'assistant', content: fullResponse });
            // Signal streaming complete
            global.mainWindow?.webContents?.send('streaming-complete', fullResponse);
            resolve(fullResponse);
          } else {
            reject('No response received from AI. Please try again.');
          }
        });
        
        res.on('error', (error) => {
          reject(`Response error: ${error.message}`);
        });
      });
      
      req.on('error', (error) => {
        reject(`Connection error: ${error.message}. Please check if Ollama is running.`);
      });
      
      req.on('timeout', () => {
        req.destroy();
        reject('Request timed out. Please try a shorter question or check your connection.');
      });
      
      req.write(data);
      req.end();
      
    } catch (error) {
      reject(`Unexpected error: ${error.message}`);
    }
  });
}

// IPC Handlers
ipcMain.handle('ollama-status', async () => {
  return await checkOllamaStatus();
});

ipcMain.handle('check-model', async () => {
  return await checkModelAvailable(currentModel);
});

ipcMain.handle('set-model', async (event, model) => {
  return changeModel(model);
});

ipcMain.handle('get-current-model', async () => {
  return getCurrentModel();
});

ipcMain.handle('ollama-start', async () => {
  let command;
  const platform = os.platform();
  if (platform === 'darwin') {
    command = 'brew services start ollama || ollama serve &';
  } else if (platform === 'win32') {
    command = 'start /B ollama serve';
  } else {
    command = 'ollama serve &';
  }
  return new Promise((resolve) => {
    exec(command, (err) => {
      setTimeout(async () => {
        resolve(await checkOllamaStatus());
      }, 500);
    });
  });
});

ipcMain.handle('ollama-query', async (event, prompt) => {
  return await ollamaQueryWithStreaming(prompt);
});

ipcMain.handle('save-conversation', async () => {
  return saveConversation();
});

ipcMain.handle('load-conversation', async (event, filename) => {
  return loadConversation(filename);
});

ipcMain.handle('get-saved-conversations', async () => {
  return getSavedConversations();
});

ipcMain.handle('clear-conversation', async () => {
  currentConversation = [];
  return true;
});

ipcMain.handle('export-conversation', async () => {
  const filename = saveConversation();
  const filepath = path.join(userDataPath, filename);
  return filepath;
}); 