'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  closeWindow:    () => ipcRenderer.send('window-close'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  dragWindow:     (deltaX, deltaY) => ipcRenderer.send('window-drag', { deltaX, deltaY }),
});
