import { BackupSnapshot } from '../../types/sync';

const LOCAL_KEYS = {
  career: 'sanju-career-os-persist',
  aiSettings: 'sanju-ai-settings-persist-v3',
  agent: 'sanju-shayla-agent-persist-v1',
  personalization: 'sanzz_os_personalization_v1',
  achievements: 'sanzz_os_achievements_v1',
  xpEvents: 'sanzz_os_xp_events_v1',
  preferences: 'sanzz_os_ui_preferences_v1'
};

export const localSyncAdapter = {
  loadSnapshot(): BackupSnapshot {
    const data: any = {};
    Object.entries(LOCAL_KEYS).forEach(([key, storageKey]) => {
      const val = localStorage.getItem(storageKey);
      if (val) {
        try {
          data[key] = JSON.parse(val);
        } catch (e) {
          console.warn(`Failed to parse local key ${storageKey}:`, e);
        }
      }
    });

    return {
      version: 'v1.6.3',
      createdAt: new Date().toISOString(),
      appName: 'Sanju Career OS',
      schemaVersion: 141,
      data
    };
  },

  saveSnapshot(snapshot: BackupSnapshot): { success: boolean; restoredKeys: string[] } {
    const restoredKeys: string[] = [];
    if (!snapshot.data) return { success: false, restoredKeys };

    Object.entries(LOCAL_KEYS).forEach(([key, storageKey]) => {
      const val = snapshot.data[key as keyof typeof snapshot.data];
      if (val) {
        localStorage.setItem(storageKey, JSON.stringify(val));
        restoredKeys.push(storageKey);
      }
    });

    // Notify other components of the sync refresh
    window.dispatchEvent(new Event('local_sync_restored'));
    window.dispatchEvent(new Event('personalization_changed'));
    window.dispatchEvent(new Event('achievements_changed'));
    window.dispatchEvent(new Event('ui_preferences_changed'));

    return { success: true, restoredKeys };
  },

  getStorageSizeKB(): number {
    let total = 0;
    Object.values(LOCAL_KEYS).forEach((key) => {
      const val = localStorage.getItem(key);
      if (val) {
        total += val.length * 2; // ~2 bytes per char in UTF-16
      }
    });
    return Math.round((total / 1024) * 100) / 100;
  }
};
export default localSyncAdapter;
