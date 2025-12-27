const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  const loadURL = isDev
    ? 'http://localhost:5173' // Your Vite dev server URL
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(loadURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// File System IPC Handlers
ipcMain.handle('open-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
    ]
  });

  if (canceled || filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = filePaths[0];
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { canceled: false, filePath, content };
  } catch (error) {
    console.error('Failed to open file', error);
    return { error: 'Failed to open file.' };
  }
});

ipcMain.handle('save-file', async (event, { filePath, content }) => {
  if (!filePath) {
    const { canceled, filePath: newFilePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: 'untitled.md',
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
      ]
    });

    if (canceled || !newFilePath) {
      return { canceled: true };
    }
    filePath = newFilePath;
  }

  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { canceled: false, filePath };
  } catch (error) {
    console.error('Failed to save file', error);
    return { error: 'Failed to save file.' };
  }
});

ipcMain.handle('save-file-as', async (event, content) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'document.md',
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
    ]
  });

  if (canceled || !filePath) {
    return { canceled: true };
  }

  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { canceled: false, filePath };
  } catch (error) {
    console.error('Failed to save file as', error);
    return { error: 'Failed to save file.' };
  }
});
