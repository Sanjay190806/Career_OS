import { BackupSnapshot, RestoreResult } from '../../types/sync';
import { localSyncAdapter } from './localSyncAdapter';

export const backupService = {
  exportData(): void {
    const snapshot = localSyncAdapter.loadSnapshot();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sanzz_os_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  validateBackup(json: any): { valid: boolean; error?: string } {
    if (!json || typeof json !== 'object') {
      return { valid: false, error: 'Backup is not a valid JSON object' };
    }
    if (json.appName !== 'Sanju Career OS') {
      return { valid: false, error: 'Incompatible app backup file' };
    }
    if (!json.data || typeof json.data !== 'object') {
      return { valid: false, error: 'Backup data payload is empty or malformed' };
    }
    return { valid: true };
  },

  restoreBackup(snapshot: BackupSnapshot): RestoreResult {
    const val = this.validateBackup(snapshot);
    if (!val.valid) {
      return { success: false, restoredKeys: [], error: val.error };
    }

    try {
      const res = localSyncAdapter.saveSnapshot(snapshot);
      return { success: true, restoredKeys: res.restoredKeys };
    } catch (e: any) {
      return { success: false, restoredKeys: [], error: e.message || 'Restoration failed' };
    }
  }
};
export default backupService;
