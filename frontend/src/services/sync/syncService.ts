import { SyncMode } from '../../types/sync';
import { localSyncAdapter } from './localSyncAdapter';
import { cloudSyncAdapter } from './cloudSyncAdapter';

const SYNC_MODE_KEY = 'sanzz_os_sync_mode_v1';
const LAST_SYNC_KEY = 'sanzz_os_last_sync_v1';

export const syncService = {
  getSyncMode(): SyncMode {
    return (localStorage.getItem(SYNC_MODE_KEY) as SyncMode) || 'local-only';
  },

  setSyncMode(mode: SyncMode): void {
    localStorage.setItem(SYNC_MODE_KEY, mode);
    window.dispatchEvent(new Event('sync_config_changed'));
  },

  getLastSyncTime(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
  },

  setLastSyncTime(time: string): void {
    localStorage.setItem(LAST_SYNC_KEY, time);
    window.dispatchEvent(new Event('sync_config_changed'));
  },

  async synchronize(): Promise<{ success: boolean; conflictDetected: boolean; error?: string }> {
    const mode = this.getSyncMode();
    if (mode === 'local-only') {
      return { success: true, conflictDetected: false };
    }

    const health = await cloudSyncAdapter.getHealth();
    if (!health.online) {
      return { success: false, conflictDetected: false, error: 'Cloud server is offline' };
    }

    const localSnapshot = localSyncAdapter.loadSnapshot();

    // Push local state
    const pushSuccess = await cloudSyncAdapter.pushSnapshot(localSnapshot);
    if (!pushSuccess) {
      return { success: false, conflictDetected: false, error: 'Failed to push local snapshot' };
    }

    // Pull latest remote state
    const remoteSnapshot = await cloudSyncAdapter.pullSnapshot();
    if (remoteSnapshot) {
      // Evaluate if remote has newer timestamps
      const localTime = new Date(localSnapshot.createdAt).getTime();
      const remoteTime = new Date(remoteSnapshot.createdAt).getTime();

      if (remoteTime > localTime) {
        // Remote is newer, restore it locally
        localSyncAdapter.saveSnapshot(remoteSnapshot);
      }
    }

    this.setLastSyncTime(new Date().toISOString());
    return { success: true, conflictDetected: false };
  }
};
export default syncService;
