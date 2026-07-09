const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const {
  createStartupBackup,
  ensureDesktopDataFiles,
  exportProgressBackup,
  getDesktopDataPaths,
  importProgressBackup,
  loadProgressFile,
  saveProgressFile,
  validateProgressPayload,
} = require('./storage-node.cjs');

const isDev = Boolean(process.env.SANZZ_DESKTOP_DEV_SERVER);
let mainWindow = null;

function getIconPath() {
  const ico = path.join(__dirname, '..', 'assets', 'icon.ico');
  return fs.existsSync(ico) ? ico : undefined;
}

function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    title: 'Sanzz Career OS',
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    ...(getIconPath() ? { icon: getIconPath() } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
      devTools: isDev,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.loadURL(process.env.SANZZ_DESKTOP_DEV_SERVER);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  }

  return mainWindow;
}

function registerIpcHandlers() {
  ipcMain.handle('sanzz:get-app-info', () => ({
    name: 'Sanzz Career OS',
    version: app.getVersion(),
    desktop: true,
    localDesktopMode: true,
    platform: process.platform,
  }));

  ipcMain.handle('sanzz:load-progress', async () => loadProgressFile(app.getPath('userData')));

  ipcMain.handle('sanzz:save-progress', async (_event, data) => saveProgressFile(app.getPath('userData'), data));

  ipcMain.handle('sanzz:export-backup', async () => exportProgressBackup(app.getPath('userData')));

  ipcMain.handle('sanzz:import-backup', async (_event, data) => importProgressBackup(app.getPath('userData'), data));

  ipcMain.handle('sanzz:get-storage-location', async () => {
    const paths = await ensureDesktopDataFiles(app.getPath('userData'));
    return paths;
  });

  ipcMain.handle('sanzz:open-backup-folder', async () => {
    const paths = await ensureDesktopDataFiles(app.getPath('userData'));
    await shell.openPath(paths.backupsDir);
    return { ok: true, backupsDir: paths.backupsDir };
  });

  ipcMain.handle('sanzz:validate-backup', (_event, data) => {
    const progress = data?.progress || data;
    return validateProgressPayload(progress);
  });
}

process.on('uncaughtException', (error) => {
  console.error('[Sanzz Career OS] Main process error:', error.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Sanzz Career OS] Unhandled rejection:', reason);
});

app.whenReady().then(async () => {
  registerIpcHandlers();
  Menu.setApplicationMenu(null);
  await ensureDesktopDataFiles(app.getPath('userData'));
  await createStartupBackup(app.getPath('userData'), 'launch').catch(() => undefined);
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  createMainWindow();
});

app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
      return { action: isDev ? 'allow' : 'deny' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
