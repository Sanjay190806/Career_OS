import type { PlacementEntry } from './placementDisciplineEngine.mjs';

export const NEW_PROGRESS_KEY: string;
export const RECOVERY_METADATA_KEY: string;
export const RECOVERY_BACKUP_PREFIX: string;
export const OLD_PROGRESS_KEYS: string[];

export interface StorageInspection {
  detectedLocalStorageKeys: string[];
  detectedSessionStorageKeys: string[];
  detectedOldSources: Array<{
    sourceKey: string;
    entries: Record<string, PlacementEntry>;
    count: number;
    latestSavedDate: string;
    exists: boolean;
    rawBytes: number;
  }>;
  oldDataFound: boolean;
  oldEntriesCount: number;
  newDataFound: boolean;
  newEntriesCount: number;
  todayDate: string;
  latestSavedDate: string;
  targetKey: string;
  metadata: Record<string, unknown> | null;
}

export interface RecoveryBackupPayload {
  app: string;
  feature: string;
  reason: string;
  createdAt: string;
  targetKey: string;
  todayDate: string;
  data: Record<string, string>;
}

export function getIndiaDateKey(date?: Date): string;
export function normalizeDateKey(value: unknown, startDateKey?: string): string;
export function legacyDailyLogToPlacementEntry(log: unknown): PlacementEntry;
export function inspectProgressStorage(options?: { localStorage?: Storage; sessionStorage?: Storage; now?: Date }): StorageInspection;
export function backupProgressRecoveryData(options?: { localStorage?: Storage; sessionStorage?: Storage; now?: Date; reason?: string }): { key: string; payload: RecoveryBackupPayload };
export function recoverOldProgress(options?: { localStorage?: Storage; sessionStorage?: Storage; now?: Date; allowMergeMissingDates?: boolean }): {
  ok: boolean;
  message: string;
  backupKey: string;
  migratedCount: number;
  skippedCount: number;
  metadata: Record<string, unknown> | null;
};
export function exportRawRecoveryData(options?: { localStorage?: Storage; sessionStorage?: Storage; now?: Date }): RecoveryBackupPayload;
export function getRecoveryMetadata(storage?: Storage): Record<string, unknown> | null;
