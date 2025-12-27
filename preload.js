const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (args) => ipcRenderer.invoke('save-file', args),
  saveFileAs: (content) => ipcRenderer.invoke('save-file-as', content),
});
