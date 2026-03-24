'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow:    () => ipcRenderer.send('window-collapse'),  // collapse to edge
  minimizeWindow: () => ipcRenderer.send('window-collapse'),
  onWindowState:  (cb) => ipcRenderer.on('window-state', (_, state) => cb(state)),
});
