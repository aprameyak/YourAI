const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Core Ollama functionality
  ollamaQuery: (prompt) => ipcRenderer.invoke('ollama-query', prompt),
  ollamaStatus: () => ipcRenderer.invoke('ollama-status'),
  ollamaStart: () => ipcRenderer.invoke('ollama-start'),
  checkModel: () => ipcRenderer.invoke('check-model'),
  
  // Model switching
  setModel: (model) => ipcRenderer.invoke('set-model', model),
  getCurrentModel: () => ipcRenderer.invoke('get-current-model'),
  
  // Streaming events for ChatGPT-like experience
  onStreamingStart: (callback) => {
    ipcRenderer.removeAllListeners('streaming-start');
    ipcRenderer.on('streaming-start', callback);
  },
  onStreamingChunk: (callback) => {
    ipcRenderer.removeAllListeners('streaming-chunk');
    ipcRenderer.on('streaming-chunk', callback);
  },
  onStreamingComplete: (callback) => {
    ipcRenderer.removeAllListeners('streaming-complete');
    ipcRenderer.on('streaming-complete', callback);
  },
  
  // Private conversation management
  saveConversation: () => ipcRenderer.invoke('save-conversation'),
  loadConversation: (filename) => ipcRenderer.invoke('load-conversation', filename),
  getSavedConversations: () => ipcRenderer.invoke('get-saved-conversations'),
  clearConversation: () => ipcRenderer.invoke('clear-conversation'),
  exportConversation: () => ipcRenderer.invoke('export-conversation')
}); 