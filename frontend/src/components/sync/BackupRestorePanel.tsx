import React, { useState } from 'react';
import { Download, Upload, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { backupService } from '../../services/sync/backupService';
import { localSyncAdapter } from '../../services/sync/localSyncAdapter';

export const BackupRestorePanel: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const storageSize = localSyncAdapter.getStorageSizeKB();

  const handleExport = () => {
    try {
      backupService.exportData();
      setSuccess('Data backup exported successfully!');
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to export backup file');
      setSuccess(null);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm('WARNING: Importing this backup will overwrite all current local tracker progress. Do you want to proceed?')) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const parsed = JSON.parse(raw);
        const res = backupService.restoreBackup(parsed);

        if (res.success) {
          setSuccess(`Backup restored successfully! Overwrote: ${res.restoredKeys.join(', ')}.`);
          setError(null);
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setError(res.error || 'Invalid backup structure');
          setSuccess(null);
        }
      } catch (err: any) {
        setError('Failed parsing upload JSON: invalid syntax');
        setSuccess(null);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.01] p-4.5 select-none">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Local Snapshot Maintenance</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Backup & Restore</h3>
        </div>
        <span className="text-[10px] text-textSecondary font-mono">{storageSize} KB Used</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-[10px] text-red-400">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-accentEmerald/20 bg-accentEmerald/10 p-3 text-[10px] text-accentEmerald">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-textSecondary leading-normal">
          Save your complete career tracker roadmap, achievements catalog, and planner history. 
          Use this file to import progress across other desktop or mobile environments.
        </p>

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-accentBlue py-2.5 text-xs font-bold text-white hover:bg-accentBlue/90 transition shadow-glow-blue/10"
          >
            <Download className="h-4 w-4" />
            <span>Export Backup JSON</span>
          </button>

          <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-black/45 py-2.5 text-xs font-bold text-textPrimary hover:bg-white/5 cursor-pointer transition">
            <Upload className="h-4 w-4 text-textSecondary" />
            <span>Import Backup JSON</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
export default BackupRestorePanel;
