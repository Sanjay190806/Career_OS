import { mkdir, open, readFile, rename, writeFile, copyFile } from 'node:fs/promises';
import { constants, existsSync } from 'node:fs';
import path from 'node:path';

export const DESKTOP_DATA_DIR_NAME = 'sanzz-career-os-data';
export const PROGRESS_FILE_NAME = 'progress.json';
export const SETTINGS_FILE_NAME = 'settings.json';
export const BACKUP_DIR_NAME = 'backups';

export function getDesktopDataPaths(userDataPath) {
  const dataDir = path.join(userDataPath, DESKTOP_DATA_DIR_NAME);
  return {
    dataDir,
    progressFile: path.join(dataDir, PROGRESS_FILE_NAME),
    settingsFile: path.join(dataDir, SETTINGS_FILE_NAME),
    backupsDir: path.join(dataDir, BACKUP_DIR_NAME),
    logsDir: path.join(dataDir, 'logs'),
  };
}

export function createDefaultProgress() {
  return {
    app: 'Sanzz Career OS',
    version: '1.9.0',
    storageVersion: 1,
    updatedAt: new Date().toISOString(),
    entries: {},
    selectedDate: '',
    lastBackupAt: '',
    metadata: {
      localDesktopMode: true,
    },
  };
}

export function createDefaultSettings() {
  return {
    app: 'Sanzz Career OS',
    version: '1.9.0',
    updatedAt: new Date().toISOString(),
    localDesktopMode: true,
  };
}

export async function ensureDesktopDataFiles(userDataPath) {
  const paths = getDesktopDataPaths(userDataPath);
  await mkdir(paths.dataDir, { recursive: true });
  await mkdir(paths.backupsDir, { recursive: true });
  await mkdir(paths.logsDir, { recursive: true });

  if (!existsSync(paths.progressFile)) {
    await atomicWriteJson(paths.progressFile, createDefaultProgress());
  }

  if (!existsSync(paths.settingsFile)) {
    await atomicWriteJson(paths.settingsFile, createDefaultSettings());
  }

  return paths;
}

export function validateProgressPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, reason: 'Progress payload is not an object.' };
  }

  const entries = payload.entries;
  if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
    return { valid: false, reason: 'Progress entries are missing or invalid.' };
  }

  for (const [dateKey, entry] of Object.entries(entries)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return { valid: false, reason: `Invalid date key: ${dateKey}` };
    }
    if (!entry || typeof entry !== 'object') {
      return { valid: false, reason: `Invalid entry for ${dateKey}` };
    }
  }

  return { valid: true, reason: 'Progress payload is valid.' };
}

export async function atomicWriteJson(filePath, payload) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
  const tempFile = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  const serialized = JSON.stringify(payload, null, 2);
  await writeFile(tempFile, serialized, 'utf8');
  await rename(tempFile, filePath);
}

export async function loadProgressFile(userDataPath) {
  const paths = await ensureDesktopDataFiles(userDataPath);
  try {
    const raw = await readFile(paths.progressFile, 'utf8');
    const parsed = JSON.parse(raw);
    const validation = validateProgressPayload(parsed);
    if (!validation.valid) throw new Error(validation.reason);
    return {
      ok: true,
      data: parsed,
      storagePath: paths.progressFile,
      dataDir: paths.dataDir,
      backupsDir: paths.backupsDir,
      warning: '',
      createdDefault: false,
    };
  } catch (error) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const corruptedFile = path.join(paths.dataDir, `progress.corrupted.${timestamp}.json`);
    if (existsSync(paths.progressFile)) {
      await rename(paths.progressFile, corruptedFile);
    }
    const fallback = createDefaultProgress();
    fallback.metadata.storageWarning = 'Previous progress file was corrupted and preserved separately.';
    await atomicWriteJson(paths.progressFile, fallback);
    return {
      ok: false,
      data: fallback,
      storagePath: paths.progressFile,
      dataDir: paths.dataDir,
      backupsDir: paths.backupsDir,
      warning: error instanceof Error ? error.message : 'Progress file could not be loaded.',
      corruptedFile,
      createdDefault: true,
    };
  }
}

export async function saveProgressFile(userDataPath, progressData) {
  const paths = await ensureDesktopDataFiles(userDataPath);
  const payload = {
    ...createDefaultProgress(),
    ...progressData,
    version: '1.9.0',
    updatedAt: new Date().toISOString(),
    metadata: {
      ...createDefaultProgress().metadata,
      ...(progressData?.metadata || {}),
      localDesktopMode: true,
    },
  };
  const validation = validateProgressPayload(payload);
  if (!validation.valid) {
    return { ok: false, reason: validation.reason, storagePath: paths.progressFile };
  }
  await atomicWriteJson(paths.progressFile, payload);
  return { ok: true, data: payload, storagePath: paths.progressFile };
}

export async function exportProgressBackup(userDataPath) {
  const paths = await ensureDesktopDataFiles(userDataPath);
  const loaded = await loadProgressFile(userDataPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(paths.backupsDir, `sanzz-career-os-backup-${timestamp}.json`);
  const payload = {
    app: 'Sanzz Career OS',
    feature: 'desktop-progress-backup',
    version: '1.9.0',
    exportedAt: new Date().toISOString(),
    progress: loaded.data,
  };
  await atomicWriteJson(backupFile, payload);
  return { ok: true, backupFile, payload };
}

export async function importProgressBackup(userDataPath, backupPayload) {
  const progress = backupPayload?.progress || backupPayload;
  const validation = validateProgressPayload(progress);
  if (!validation.valid) return { ok: false, reason: validation.reason };

  const preRestore = await exportProgressBackup(userDataPath);
  const saved = await saveProgressFile(userDataPath, {
    ...progress,
    metadata: {
      ...(progress.metadata || {}),
      restoredAt: new Date().toISOString(),
      preRestoreBackup: preRestore.backupFile,
    },
  });
  return {
    ...saved,
    preRestoreBackup: preRestore.backupFile,
  };
}

export async function createStartupBackup(userDataPath, reason = 'startup') {
  const paths = await ensureDesktopDataFiles(userDataPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(paths.backupsDir, `startup-${reason}-${timestamp}.json`);
  await copyFile(paths.progressFile, backupFile);
  return { ok: true, backupFile };
}

export async function fileExists(filePath) {
  try {
    const handle = await open(filePath, constants.O_RDONLY);
    await handle.close();
    return true;
  } catch {
    return false;
  }
}

