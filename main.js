'use strict';

const { app, BrowserWindow, Tray, Menu, nativeImage, screen, ipcMain } = require('electron');
const path   = require('path');
const { spawn } = require('child_process');
const http   = require('http');
const fs     = require('fs');

// ─── Config ───────────────────────────────────────────────────
const SERVER_PORT  = 8765;
const WINDOW_W     = 420;
const WINDOW_H     = 600;
const PEEK_W       = 6;    // pixels visible when collapsed (edge peek)
const MARGIN_Y     = 80;   // distance from top of screen
const ANIM_STEPS   = 12;   // animation frames
const ANIM_MS      = 12;   // ms per frame
const HOVER_ZONE   = 20;   // px from right edge that triggers expand

let mainWindow  = null;
let tray        = null;
let serverProc  = null;
let isQuitting  = false;
let isExpanded  = false;
let animTimer   = null;
let pollTimer   = null;

// ─── App ready ────────────────────────────────────────────────
app.whenReady().then(() => {
  if (app.dock) app.dock.hide();
  createTray();
  createWindow();
  startPythonServer();
  startMousePoll();
});

app.on('before-quit', () => { isQuitting = true; });
app.on('window-all-closed', () => { /* keep running in tray */ });

// ─── Tray ─────────────────────────────────────────────────────
function createTray() {
  // Create a simple text-based tray icon using a canvas-like approach
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let icon;
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
    icon = icon.resize({ width: 18, height: 18 });
    icon.setTemplateImage(true);
  } else {
    // Create a minimal 18x18 white square as fallback (visible in menu bar)
    // Use a 1x1 white pixel scaled up
    const size = 18;
    const buf = Buffer.alloc(size * size * 4, 0);
    // Draw a simple "D" shape — fill all pixels white for template image
    for (let i = 0; i < size * size * 4; i += 4) {
      buf[i]   = 255; // R
      buf[i+1] = 255; // G
      buf[i+2] = 255; // B
      buf[i+3] = 200; // A
    }
    icon = nativeImage.createFromBuffer(buf, { width: size, height: size });
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);
  tray.setToolTip('Docify — right-click to quit');

  const menu = Menu.buildFromTemplate([
    { label: 'Show Docify',  click: () => expandWindow() },
    { label: 'Hide Docify',  click: () => collapseWindow() },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => isExpanded ? collapseWindow() : expandWindow());
}

// ─── Window ───────────────────────────────────────────────────
function getCollapsedX() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  return width - PEEK_W;
}

function getExpandedX() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  return width - WINDOW_W;
}

function getWindowY() {
  const { height } = screen.getPrimaryDisplay().workAreaSize;
  // Center vertically
  return Math.round((height - WINDOW_H) / 2);
}

function createWindow() {
  const startX = getCollapsedX();
  const startY = getWindowY();

  mainWindow = new BrowserWindow({
    width:  WINDOW_W,
    height: WINDOW_H,
    x: startX,
    y: startY,
    frame:           false,
    transparent:     false,
    resizable:       false,
    alwaysOnTop:     true,
    skipTaskbar:     true,
    backgroundColor: '#FFFFFF',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      webSecurity:      false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'popup.html'));
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault();
      collapseWindow();
    }
  });
}

// ─── Slide animation ──────────────────────────────────────────
function animateTo(targetX, onDone) {
  if (!mainWindow) return;
  if (animTimer) { clearInterval(animTimer); animTimer = null; }

  const [curX, curY] = mainWindow.getPosition();
  const steps = ANIM_STEPS;
  let step = 0;

  animTimer = setInterval(() => {
    step++;
    const t = step / steps;
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);
    const newX = Math.round(curX + (targetX - curX) * ease);
    mainWindow.setPosition(newX, curY);
    if (step >= steps) {
      clearInterval(animTimer);
      animTimer = null;
      mainWindow.setPosition(targetX, curY);
      if (onDone) onDone();
    }
  }, ANIM_MS);
}

function expandWindow() {
  if (isExpanded || !mainWindow) return;
  isExpanded = true;
  mainWindow.show();
  mainWindow.focus();
  animateTo(getExpandedX());
  // Notify renderer
  mainWindow.webContents.send('window-state', 'expanded');
}

function collapseWindow() {
  if (!isExpanded || !mainWindow) return;
  isExpanded = false;
  animateTo(getCollapsedX(), () => {
    // Keep window visible but at edge (so mouse poll can detect hover)
  });
  mainWindow.webContents.send('window-state', 'collapsed');
}

// ─── Mouse proximity poll ─────────────────────────────────────
// Only expand when mouse near right edge.
// Collapsing is ONLY triggered by the × button or tray menu — never automatically.
function startMousePoll() {
  const { screen: electronScreen } = require('electron');
  pollTimer = setInterval(() => {
    if (!mainWindow || isExpanded) return;  // don't auto-collapse once expanded
    const { x, y } = electronScreen.getCursorScreenPoint();
    const { width } = electronScreen.getPrimaryDisplay().workAreaSize;
    const winY = getWindowY();

    const nearRightEdge   = x >= width - HOVER_ZONE;
    const inVerticalRange = y >= winY && y <= winY + WINDOW_H;

    if (nearRightEdge && inVerticalRange) {
      expandWindow();
    }
  }, 150);
}

// ─── IPC ──────────────────────────────────────────────────────
ipcMain.on('window-close', () => collapseWindow());
ipcMain.on('window-collapse', () => collapseWindow());

// ─── Python server ────────────────────────────────────────────
function startPythonServer() {
  checkServer(running => {
    if (running) { console.log('Server already running on port', SERVER_PORT); return; }
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
  const candidates = [
    path.join(process.resourcesPath, 'latex_server.py'),
    path.join(__dirname, '..', 'doc-converter-extension', 'latex_server.py'),
    path.join(app.getPath('home'), 'Desktop', 'asin', 'doc-converter-extension', 'latex_server.py'),
  ];
  const serverScript = candidates.find(p => fs.existsSync(p));
  if (!serverScript) { console.warn('latex_server.py not found'); return; }

  const pythonCandidates = [
    '/Library/Frameworks/Python.framework/Versions/3.12/bin/python3',
    '/usr/local/bin/python3',
    '/opt/homebrew/bin/python3',
    '/usr/bin/python3',
  ];
  const python = pythonCandidates.find(p => fs.existsSync(p)) || 'python3';

  serverProc = spawn(python, [serverScript], {
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProc.stdout.on('data', d => console.log('[server]', d.toString().trim()));
  serverProc.stderr.on('data', d => console.warn('[server]', d.toString().trim()));
  app.on('quit', () => { if (serverProc && !serverProc.killed) serverProc.kill(); });
}
