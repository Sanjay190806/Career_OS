import { BackupSnapshot, SyncHealth } from '../../types/sync';

export const cloudSyncAdapter = {
  async getHealth(): Promise<SyncHealth> {
    try {
      const response = await fetch('/api/sync/health');
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'online',
          online: true,
          dbConnected: data.dbConnected || false,
          latencyMs: 12
        };
      }
    } catch (e) {
      // Offline fallback
    }
    return {
      status: 'offline',
      online: false,
      dbConnected: false
    };
  },

  async pushSnapshot(snapshot: BackupSnapshot): Promise<boolean> {
    try {
      const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot })
      });
      return response.ok;
    } catch (e) {
      console.warn('Failed pushing snapshot to cloud server:', e);
      return false;
    }
  },

  async pullSnapshot(): Promise<BackupSnapshot | null> {
    try {
      const response = await fetch('/api/sync/pull');
      if (response.ok) {
        const data = await response.json();
        return data.snapshot as BackupSnapshot;
      }
    } catch (e) {
      console.warn('Failed pulling snapshot from cloud server:', e);
    }
    return null;
  }
};
export default cloudSyncAdapter;
