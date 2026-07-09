const { contextBridge, ipcRenderer } = require('electron');

const api = {
  getAppInfo: () => ipcRenderer.invoke('sanzz:get-app-info'),
  loadProgress: () => ipcRenderer.invoke('sanzz:load-progress'),
  saveProgress: (data) => ipcRenderer.invoke('sanzz:save-progress', data),
  exportBackup: () => ipcRenderer.invoke('sanzz:export-backup'),
  importBackup: (data) => ipcRenderer.invoke('sanzz:import-backup', data),
  getStorageLocation: () => ipcRenderer.invoke('sanzz:get-storage-location'),
  openBackupFolder: () => ipcRenderer.invoke('sanzz:open-backup-folder'),
  validateBackup: (data) => ipcRenderer.invoke('sanzz:validate-backup', data),
};

contextBridge.exposeInMainWorld('sanzzOS', api);

