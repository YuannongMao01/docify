'use strict';

const { app, BrowserWindow, Tray, Menu, nativeImage, screen, ipcMain, shell } = require('electron');
const path  = require('path');
const { spawn, execFile } = require('child_process');
const http  = require('http');
const fs    = require('fs');

// ─── Config ───────────────────────────────────────────────────
const SERVER_PORT  = 8765;
const WINDOW_W     = 420;
const WINDOW_H     = 620;
const MARGIN       = 16;   // distance from screen edge

let mainWindow  = null;
let tray        = null;
let serverProc  = null;
let isQuitting  = false;

// ─── App ready ────────────────────────────────────────────────
app.whenReady().then(() => {
  // Hide from Dock (menu-bar-only app)
  if (app.dock) app.dock.hide();

  createTray();
  createWindow();
  startPythonServer();
});

app.on('before-quit', () => { isQuitting = true; });
app.on('window-all-closed', () => { /* keep running in tray */ });

// ─── Tray ─────────────────────────────────────────────────────
function createTray() {
  // Use a simple template image (white icon for dark menu bar)
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let icon;
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
    icon = icon.resize({ width: 18, height: 18 });
    icon.setTemplateImage(true);
  } else {
    // Fallback: create a simple 18x18 icon programmatically
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('Docify');

  const menu = Menu.buildFromTemplate([
    { label: 'Show / Hide Docify', click: toggleWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', toggleWindow);
}

// ─── Window ───────────────────────────────────────────────────
function createWindow() {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width:  WINDOW_W,
    height: WINDOW_H,
    x: sw - WINDOW_W - MARGIN,
    y: sh - WINDOW_H - MARGIN,
    frame:           false,       // frameless
    transparent:     false,
    resizable:       true,
    alwaysOnTop:     true,
    skipTaskbar:     true,
    backgroundColor: '#FFFFFF',
    titleBarStyle:   'hidden',
    webPreferences: {
      preload:            path.join(__dirname, 'preload.js'),
      contextIsolation:   true,
      nodeIntegration:    false,
      webSecurity:        false,   // allow loading local lib files
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'popup.html'));

  // Keep window on top even when other apps are fullscreen
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  // Don't destroy on close — just hide
  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // Open DevTools in dev mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    // Re-position near bottom-right before showing
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow.setPosition(sw - WINDOW_W - MARGIN, sh - WINDOW_H - MARGIN);
    mainWindow.show();
    mainWindow.focus();
  }
}

// ─── IPC: window drag / close / minimize ─────────────────────
ipcMain.on('window-drag', (e, { deltaX, deltaY }) => {
  if (!mainWindow) return;
  const [x, y] = mainWindow.getPosition();
  mainWindow.setPosition(x + deltaX, y + deltaY);
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

// ─── Python server ────────────────────────────────────────────
function startPythonServer() {
  // Check if server is already running
  checkServer(running => {
    if (running) {
      console.log('Server already running on port', SERVER_PORT);
      return;
    }
    launchServer();
  });
}

function checkServer(cb) {
  const req = http.get(`http://localhost:${SERVER_PORT}/health`, res => {
    cb(res.statusCode === 200);
  });
  req.on('error', () => cb(false));
  req.setTimeout(1000, () => { req.destroy(); cb(false); });
}

function launchServer() {
  // Find latex_server.py — check multiple locations
  const candidates = [
    path.join(process.resourcesPath, 'latex_server.py'),                    // packaged app
    path.join(__dirname, '..', 'doc-converter-extension', 'latex_server.py'), // dev mode
    path.join(app.getPath('home'), 'Desktop', 'asin', 'doc-converter-extension', 'latex_server.py'),
  ];

  const serverScript = candidates.find(p => fs.existsSync(p));
  if (!serverScript) {
    console.warn('latex_server.py not found, server not started');
    return;
  }

  const python = findPython();
  if (!python) {
    console.warn('Python not found, server not started');
    return;
  }

  console.log(`Starting server: ${python} ${serverScript}`);
  serverProc = spawn(python, [serverScript], {
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProc.stdout.on('data', d => console.log('[server]', d.toString().trim()));
  serverProc.stderr.on('data', d => console.warn('[server]', d.toString().trim()));
  serverProc.on('exit', code => console.log('[server] exited with code', code));

  app.on('quit', () => {
    if (serverProc && !serverProc.killed) serverProc.kill();
  });
}

function findPython() {
  const candidates = [
    '/Library/Frameworks/Python.framework/Versions/3.12/bin/python3',
    '/usr/local/bin/python3',
    '/opt/homebrew/bin/python3',
    '/usr/bin/python3',
  ];
  return candidates.find(p => fs.existsSync(p)) || 'python3';
}
