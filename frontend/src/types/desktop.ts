import type { PlacementEntry } from '../utils/placementDisciplineEngine.mjs';

export interface DesktopProgressPayload {
  app: string;
  version: string;
  storageVersion: number;
  updatedAt: string;
  entries: Record<string, PlacementEntry>;
  selectedDate: string;
  lastBackupAt: string;
  metadata: Record<string, unknown>;
}

export interface DesktopProgressResult {
  ok: boolean;
  data: DesktopProgressPayload;
  storagePath: string;
  dataDir: string;
  backupsDir: string;
  warning?: string;
  corruptedFile?: string;
  createdDefault?: boolean;
  reason?: string;
}

export interface SanzzDesktopAPI {
  getAppInfo: () => Promise<{ name: string; version: string; desktop: boolean; localDesktopMode: boolean; platform: string }>;
  loadProgress: () => Promise<DesktopProgressResult>;
  saveProgress: (data: Partial<DesktopProgressPayload>) => Promise<DesktopProgressResult>;
  exportBackup: () => Promise<{ ok: boolean; backupFile: string; payload: unknown }>;
  importBackup: (data: unknown) => Promise<DesktopProgressResult & { preRestoreBackup?: string }>;
  getStorageLocation: () => Promise<{ dataDir: string; progressFile: string; settingsFile: string; backupsDir: string; logsDir: string }>;
  openBackupFolder: () => Promise<{ ok: boolean; backupsDir: string }>;
  validateBackup: (data: unknown) => Promise<{ valid: boolean; reason: string }>;
}

declare global {
  interface Window {
    sanzzOS?: SanzzDesktopAPI;
  }
}

export {};

