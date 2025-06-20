const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const http = require('http');
const os = require('os');
const { exec } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.loadFile('index.html');
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

function checkOllamaStatus() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 11434,
      path: '/api/tags',
      method: 'GET',
      timeout: 2000,
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}
ipcMain.handle('ollama-status', async () => {
  return await checkOllamaStatus();
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
      }, 2000);
    });
  });
});
ipcMain.handle('ollama-query', async (event, prompt) => {
  return new Promise((resolve) => {
    const data = JSON.stringify({ model: 'llama3', prompt });
    const req = http.request({
      hostname: 'localhost',
      port: 11434,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    }, (res) => {
      let fullResponse = '';
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        let lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (obj.response) fullResponse += obj.response;
          } catch {}
        }
      });
      res.on('end', () => {
        resolve(fullResponse || 'Error occurred');
      });
    });
    req.on('error', () => resolve('Error occurred'));
    req.write(data);
    req.end();
    setTimeout(() => resolve('Error occurred'), 60000);
  });
}); 