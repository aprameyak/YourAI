const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  ollamaQuery: (prompt) => ipcRenderer.invoke('ollama-query', prompt),
  ollamaStatus: () => ipcRenderer.invoke('ollama-status'),
  ollamaStart: () => ipcRenderer.invoke('ollama-start')
}); 