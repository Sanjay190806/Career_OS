import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { syncService } from '../../services/sync/syncService';
import { SyncMode } from '../../types/sync';

export const SyncSettingsPanel: React.FC = () => {
  const [mode, setMode] = useState<SyncMode>(() => syncService.getSyncMode());
  const [lastSync, setLastSync] = useState<string | null>(() => syncService.getLastSyncTime());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const handleSyncChanged = () => {
      setLastSync(syncService.getLastSyncTime());
    };
    window.addEventListener('sync_config_changed', handleSyncChanged);
    return () => window.removeEventListener('sync_config_changed', handleSyncChanged);
  }, []);

  const handleModeChange = (newMode: SyncMode) => {
    setMode(newMode);
    syncService.setSyncMode(newMode);
  };

  const handleSyncNow = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const res = await syncService.synchronize();
      if (res.success) {
        setStatus('success');
        setMsg('Sync completed successfully!');
      } else {
        setStatus('error');
        setMsg(res.error || 'Failed to complete sync');
      }
    } catch (e: any) {
      setStatus('error');
      setMsg(e.message || 'Synchronization failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.01] p-4.5 select-none">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Multi-Device Setup</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Cloud Sync Configuration</h3>
        </div>
        {mode !== 'local-only' ? (
          <span className="inline-flex items-center gap-1 text-accentBlue text-[9px] font-black uppercase tracking-wider">
            <Cloud className="h-3.5 w-3.5" />
            <span>Cloud Ready</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-textMuted text-[9px] font-bold uppercase tracking-wider">
            <CloudOff className="h-3.5 w-3.5" />
            <span>Local Mode</span>
          </span>
        )}
      </div>

      {status && (
        <div className={`flex items-center gap-2 rounded-xl border p-3 text-[10px] ${
          status === 'success' ? 'border-accentEmerald/20 bg-accentEmerald/10 text-accentEmerald' : 'border-red-500/20 bg-red-500/10 text-red-400'
        }`}>
          {status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          <span>{msg}</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {(['local-only', 'cloud-ready'] as SyncMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={`flex-1 rounded-xl border py-2.5 text-center text-xs font-black uppercase tracking-wider transition ${
                mode === m
                  ? 'border-accentBlue bg-accentBlue/10 text-textPrimary'
                  : 'border-white/5 bg-white/[0.01] text-textSecondary hover:bg-white/5'
              }`}
            >
              {m.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/5 bg-black/45 p-3 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-textMuted uppercase font-bold">Last Synchronized</span>
            <span className="text-[10px] text-textSecondary font-mono truncate max-w-[180px]">
              {lastSync ? new Date(lastSync).toLocaleString() : 'Never synced'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSyncNow}
            disabled={busy || mode === 'local-only'}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-[10px] font-black text-textPrimary hover:bg-white/10 transition uppercase tracking-wider"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default SyncSettingsPanel;
