import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createBackup,
  createEmptyEntry,
  toISODate,
  validateBackupShape,
  type BackupPayload,
  type PlacementEntry,
} from '../../utils/placementDisciplineEngine.mjs';
import {
  backupProgressRecoveryData,
  inspectProgressStorage,
  recoverOldProgress,
  type StorageInspection,
} from '../../utils/progressRecovery.mjs';

interface PlacementDisciplineState {
  entries: Record<string, PlacementEntry>;
  selectedDate: string;
  lastBackupAt: string;
  recoveryStatus: string;
  lastRecoveryInspection: StorageInspection | null;
  setSelectedDate: (dateKey: string) => void;
  updateTodayEntry: (todayKey: string, patch: Partial<PlacementEntry>) => void;
  exportBackup: () => BackupPayload;
  restoreBackup: (payload: unknown) => { ok: boolean; message: string };
  inspectRecovery: () => StorageInspection | null;
  backupRecoveryData: () => { ok: boolean; message: string; key?: string };
  recoverOldProgress: () => { ok: boolean; message: string };
  autoRecoverOldProgress: () => { ok: boolean; message: string };
  importDesktopProgress: (payload: { entries?: Record<string, PlacementEntry>; selectedDate?: string; lastBackupAt?: string }) => void;
  saveDesktopProgress: () => Promise<{ ok: boolean; message: string }>;
}

export const usePlacementDisciplineStore = create<PlacementDisciplineState>()(
  persist(
    (set, get) => ({
      entries: {},
      selectedDate: toISODate(),
      lastBackupAt: '',
      recoveryStatus: '',
      lastRecoveryInspection: null,
      setSelectedDate: (dateKey) => set({ selectedDate: dateKey }),
      updateTodayEntry: (todayKey, patch) => set((state) => {
        const current = state.entries[todayKey] || createEmptyEntry();
        return {
          selectedDate: todayKey,
          entries: {
            ...state.entries,
            [todayKey]: {
              ...current,
              ...patch,
              savedAt: new Date().toISOString(),
            },
          },
        };
      }),
      exportBackup: () => {
        const backup = createBackup(get().entries, { lastBackupAt: new Date().toISOString() });
        set({ lastBackupAt: backup.exportedAt });
        return backup;
      },
      restoreBackup: (payload) => {
        const validation = validateBackupShape(payload);
        if (!validation.valid) return { ok: false, message: validation.reason };
        const backup = payload as BackupPayload;
        set({ entries: backup.entries, lastBackupAt: backup.exportedAt, selectedDate: toISODate() });
        return { ok: true, message: 'Backup restored.' };
      },
      inspectRecovery: () => {
        if (typeof window === 'undefined') return null;
        const inspection = inspectProgressStorage();
        set({ lastRecoveryInspection: inspection });
        return inspection;
      },
      backupRecoveryData: () => {
        if (typeof window === 'undefined') return { ok: false, message: 'Storage is unavailable.' };
        try {
          const backup = backupProgressRecoveryData({ reason: 'manual-progress-recovery-backup' });
          set({ lastBackupAt: backup.payload.createdAt, recoveryStatus: `Backup created: ${backup.key}` });
          return { ok: true, message: `Backup created: ${backup.key}`, key: backup.key };
        } catch {
          set({ recoveryStatus: 'Backup failed.' });
          return { ok: false, message: 'Backup failed.' };
        }
      },
      recoverOldProgress: () => {
        if (typeof window === 'undefined') return { ok: false, message: 'Storage is unavailable.' };
        const result = recoverOldProgress({ allowMergeMissingDates: true });
        const inspection = inspectProgressStorage();
        const nextEntries = inspection.newDataFound ? { ...inspection.detectedOldSources.reduce<Record<string, PlacementEntry>>((acc, source) => ({ ...acc, ...source.entries }), {}), ...get().entries } : get().entries;
        const latestStored = localStorage.getItem('sanzz-placement-discipline-v18');
        let parsed: { state?: { entries?: Record<string, PlacementEntry> } } | null = null;
        try {
          parsed = latestStored ? JSON.parse(latestStored) : null;
        } catch {
          parsed = null;
        }
        const entries = parsed?.state?.entries || nextEntries;
        set({
          entries,
          selectedDate: toISODate(),
          lastRecoveryInspection: inspection,
          recoveryStatus: result.message,
          lastBackupAt: result.backupKey || get().lastBackupAt,
        });
        return { ok: result.ok, message: result.message };
      },
      autoRecoverOldProgress: () => {
        if (typeof window === 'undefined') return { ok: false, message: 'Storage is unavailable.' };
        const inspection = inspectProgressStorage();
        set({ lastRecoveryInspection: inspection });
        if (!inspection.oldDataFound) return { ok: false, message: 'No old progress data found.' };
        if (inspection.newDataFound) return { ok: false, message: 'v1.8 data already exists. Auto recovery skipped to avoid overwrite.' };
        const result = recoverOldProgress();
        const latestStored = localStorage.getItem('sanzz-placement-discipline-v18');
        let parsed: { state?: { entries?: Record<string, PlacementEntry> } } | null = null;
        try {
          parsed = latestStored ? JSON.parse(latestStored) : null;
        } catch {
          parsed = null;
        }
        set({
          entries: parsed?.state?.entries || get().entries,
          selectedDate: toISODate(),
          recoveryStatus: result.message,
          lastRecoveryInspection: inspectProgressStorage(),
          lastBackupAt: result.backupKey || get().lastBackupAt,
        });
        return { ok: result.ok, message: result.message };
      },
      importDesktopProgress: (payload) => {
        if (!payload?.entries || Object.keys(payload.entries).length === 0) return;
        set({
          entries: payload.entries,
          selectedDate: payload.selectedDate || toISODate(),
          lastBackupAt: payload.lastBackupAt || get().lastBackupAt,
          recoveryStatus: 'Desktop progress loaded from local file storage.',
        });
      },
      saveDesktopProgress: async () => {
        if (typeof window === 'undefined' || !window.sanzzOS) {
          return { ok: false, message: 'Desktop storage API is unavailable.' };
        }
        const state = get();
        const result = await window.sanzzOS.saveProgress({
          entries: state.entries,
          selectedDate: state.selectedDate,
          lastBackupAt: state.lastBackupAt,
          metadata: {
            savedFromRenderer: true,
            savedAt: new Date().toISOString(),
          },
        });
        return {
          ok: result.ok,
          message: result.ok ? 'Desktop progress file saved.' : result.reason || 'Desktop progress save failed.',
        };
      },
    }),
    {
      name: 'sanzz-placement-discipline-v18',
      version: 1,
      partialize: (state) => ({
        entries: state.entries,
        selectedDate: state.selectedDate,
        lastBackupAt: state.lastBackupAt,
      }),
    }
  )
);
