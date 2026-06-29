import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CircleCheckBig, RefreshCw, ShieldCheck, WandSparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Badge } from '../components/ui/Badge';
import { useCareerStore } from '../app/store/useCareerStore';
import { useAIStore } from '../app/store/useAIStore';
import { syncService } from '../services/syncService';
import { aiService } from '../services/aiService';
import { ApiError } from '../services/apiClient';
import { exportJSON, restore, clear } from '../utils/storageUtils';
import { useAISettingsStore } from '../app/store/useAISettingsStore';

type HealthStatus = {
  backendOnline: boolean;
  apiStatus: string;
  databaseStatus: string;
  groqStatus: string;
  groqModel: string;
  environment?: string;
  timestamp?: string;
};

type AIStatus = {
  backendOnline: boolean;
  groqConfigured: boolean;
  model: string;
  streamingSupported: boolean;
};

type Notice = {
  text: string;
  type: 'success' | 'error';
};

function friendlyAiMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'missing_groq_api_key' || error.status === 503) {
      return 'Groq API key missing in backend/.env.';
    }
    if (error.code === 'invalid_groq_api_key' || error.status === 401 || error.status === 403) {
      return 'Groq API key invalid or rejected.';
    }
    if (error.code === 'groq_rate_limited' || error.status === 429) {
      return 'Groq quota/rate limit reached. Try again later.';
    }
    return error.message || 'AI test failed.';
  }

  if (error instanceof Error) {
    if (/failed to fetch/i.test(error.message)) {
      return 'Backend offline. Start npm run dev in backend.';
    }
    return error.message;
  }
  return 'AI test failed.';
}

export const SettingsPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const setCareerState = useCareerStore.setState;
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('Never');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [lastAiStatus, setLastAiStatus] = useState<string>('No test run yet');
  const [lastAiTestTime, setLastAiTestTime] = useState<string>('Never');
  const [aiBusy, setAiBusy] = useState(false);

  const summaryCards = useMemo(() => ([
    {
      label: 'Backend',
      value: health?.backendOnline ? 'Online' : 'Offline',
      detail: `API: ${health?.apiStatus || 'unknown'}`
    },
    {
      label: 'Database',
      value: health?.databaseStatus || 'unknown',
      detail: 'Prisma-backed persistence'
    },
    {
      label: 'Groq',
      value: aiStatus?.groqConfigured ? 'Configured' : 'Missing',
      detail: 'Backend-only secret'
    },
    {
      label: 'AI Model',
      value: useAISettingsStore.getState().activeModel,
      detail: `Mode: ${useAISettingsStore.getState().activeMode} | Provider: ${useAISettingsStore.getState().activeProvider}`
    },
    {
      label: 'Streaming',
      value: aiStatus?.streamingSupported ? 'Ready' : 'Fallback',
      detail: aiStatus?.streamingSupported ? 'Streaming enabled on backend' : 'Streaming unavailable'
    },
    {
      label: 'AI Status',
      value: lastAiStatus,
      detail: `Last test: ${lastAiTestTime}`
    },
    {
      label: 'Environment',
      value: health?.environment || 'unknown',
      detail: health?.timestamp || 'Waiting for health check'
    }
  ]), [health, aiStatus, lastAiStatus, lastAiTestTime]);

  const checkHealth = async () => {
    const [backendResult, aiResult] = await Promise.allSettled([
      syncService.getBackendHealth(),
      aiService.getStatus()
    ]);

    if (backendResult.status === 'fulfilled') {
      const payload = backendResult.value;
      setHealth({
        backendOnline: !!payload,
        apiStatus: payload?.api?.status || 'unknown',
        databaseStatus: payload?.database?.status || 'unknown',
        groqStatus: payload?.groq?.status || 'unknown',
        groqModel: payload?.groq?.model || 'llama-3.1-8b-instant',
        environment: payload?.environment,
        timestamp: payload?.timestamp
      });
    } else {
      setHealth({
        backendOnline: false,
        apiStatus: 'offline',
        databaseStatus: 'unavailable',
        groqStatus: 'missing',
        groqModel: 'llama-3.1-8b-instant',
        environment: undefined,
        timestamp: undefined
      });
    }

    if (aiResult.status === 'fulfilled') {
      setAiStatus(aiResult.value);
    } else {
      setAiStatus({
        backendOnline: false,
        groqConfigured: false,
        model: 'llama-3.1-8b-instant',
        streamingSupported: false
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handlePushSync = async () => {
    setSyncLoading(true);
    setNotice(null);
    try {
      const isOnline = await syncService.checkBackendHealth();
      if (!isOnline) {
        throw new Error('Backend service is offline. Start the server first.');
      }

      const res = await syncService.pushSnapshot('local-user', careerState);
      if (res.success) {
        setLastSynced(new Date(res.updatedAt).toLocaleString());
        setNotice({ text: 'Snapshot pushed and backed up to the database successfully.', type: 'success' });
      }
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : 'Failed to push backup to database.', type: 'error' });
    } finally {
      setSyncLoading(false);
    }
  };

  const handlePullSync = async () => {
    setSyncLoading(true);
    setNotice(null);
    try {
      const isOnline = await syncService.checkBackendHealth();
      if (!isOnline) {
        throw new Error('Backend service is offline.');
      }

      const pulledData = await syncService.pullSnapshot('local-user');
      if (!pulledData) {
        throw new Error('No database backups found for this user.');
      }

      setCareerState(pulledData);
      setNotice({ text: 'State pulled and restored from the database successfully.', type: 'success' });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : 'Failed to pull state from database.', type: 'error' });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleExport = () => exportJSON(careerState);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const raw = loadEvent.target?.result as string;
        const restoredState = restore(raw);
        setCareerState(restoredState);
        setNotice({ text: 'State imported from file successfully.', type: 'success' });
      } catch {
        setNotice({ text: 'Failed to import. The file does not match the expected snapshot schema.', type: 'error' });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleReset = () => {
    const confirmText = window.prompt("WARNING: This will clear all local tracking data. Type 'RESET SANJU OS' to confirm:");
    if (confirmText === 'RESET SANJU OS') {
      clear();
      window.location.reload();
    } else if (confirmText !== null) {
      setNotice({ text: 'Invalid confirmation text. Reset aborted.', type: 'error' });
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear Shayla AI chat thread history?')) {
      useAIStore.getState().clearChat();
      setNotice({ text: 'AI chat history cleared successfully.', type: 'success' });
    }
  };

  const handleClearBadges = () => {
    if (window.confirm('Are you sure you want to clear all unlocked achievements and XP progress?')) {
      setCareerState({ unlockedBadges: {}, xp: 0, level: 1 } as any);
      setNotice({ text: 'Achievements progress reset successfully.', type: 'success' });
    }
  };

  const handleTestShayla = async () => {
    setAiBusy(true);
    setNotice(null);
    try {
      const response = await aiService.sendMessage(
        [{ role: 'user', content: 'Say hello as Shayla and teach one beginner German phrase.' }],
        { userProfile: careerState.userProfile }
      );

      setLastAiStatus(response.reply ? 'Shayla replied successfully.' : 'Shayla returned an empty response.');
      setLastAiTestTime(new Date().toLocaleString());
      setNotice({ text: 'Shayla AI test completed successfully.', type: 'success' });
    } catch (error) {
      const message = friendlyAiMessage(error);
      setLastAiStatus(message);
      setLastAiTestTime(new Date().toLocaleString());
      setNotice({ text: message, type: 'error' });
    } finally {
      setAiBusy(false);
    }
  };

  const handleTestGroq = async () => {
    setAiBusy(true);
    setNotice(null);
    try {
      const result = await aiService.testGroq();
      setLastAiStatus(result.ok ? result.message : result.message);
      setLastAiTestTime(new Date().toLocaleString());
      setNotice({ text: result.message, type: result.ok ? 'success' : 'error' });
    } catch (error) {
      const message = friendlyAiMessage(error);
      setLastAiStatus(message);
      setLastAiTestTime(new Date().toLocaleString());
      setNotice({ text: message, type: 'error' });
    } finally {
      setAiBusy(false);
    }
  };

  const checklist = [
    {
      label: 'Add Groq key in backend',
      done: health?.groqStatus === 'configured',
      detail: health?.groqStatus === 'configured' ? 'Configured in backend/.env' : 'Missing in backend/.env'
    },
    {
      label: 'Start database',
      done: health?.databaseStatus === 'connected' || health?.databaseStatus === 'healthy',
      detail: health?.databaseStatus || 'Not checked yet'
    },
    {
      label: 'Save first day',
      done: Object.keys(careerState.dailyLogs || {}).length > 0,
      detail: 'Track a daily log'
    },
    {
      label: 'Complete first LC',
      done: (careerState.xp || 0) > 0,
      detail: 'Earn XP from progress'
    },
    {
      label: 'Push backup',
      done: lastSynced !== 'Never',
      detail: lastSynced
    },
    {
      label: 'Generate report',
      done: Object.keys(careerState.dailyLogs || {}).length > 0,
      detail: 'Use the Reports page'
    }
  ];

  return (
    <div className="fade-in flex flex-col gap-6 pb-10">
      <SectionHeader
        title="Settings & Cloud Backups"
        subtitle="Manage local storage, exports, sync state, and AI/backend readiness"
      />

      {notice && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs ${
            notice.type === 'success'
              ? 'border-accentEmerald/20 bg-accentEmerald/10 text-accentEmerald'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-bold text-current">
            x
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Backend & AI</p>
              <h3 className="mt-1 text-lg font-semibold text-textPrimary">Status and Shayla test</h3>
            </div>
            <div className={`topbar-chip ${health?.backendOnline ? 'text-accentEmerald' : 'text-accentOrange'}`}>
              {health?.backendOnline ? <CircleCheckBig className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
              <span>{health?.backendOnline ? 'Backend online' : 'Backend offline'}</span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {summaryCards.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-textPrimary">{item.value}</p>
                <p className="mt-1 text-xs text-textSecondary">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={checkHealth} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Backend
            </Button>
            <Button type="button" onClick={handleTestGroq} size="sm" disabled={aiBusy}>
              <WandSparkles className="mr-2 h-4 w-4" />
              Test Groq
            </Button>
            <Button type="button" onClick={handleTestShayla} size="sm" variant="outline" disabled={aiBusy}>
              <WandSparkles className="mr-2 h-4 w-4" />
              Test Shayla
            </Button>
            <Button type="button" onClick={handleClearChat} size="sm" variant="outline">
              Clear AI History
            </Button>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4 text-xs text-textSecondary">
            <p className="font-semibold text-textPrimary">Test prompt</p>
            <p className="mt-1">Say hello as Shayla and teach one beginner German phrase.</p>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4 text-xs text-textSecondary">
            <p className="font-semibold text-textPrimary">Security note</p>
            <p className="mt-1">
              The Groq API key stays in <code className="rounded bg-black/20 px-1 py-0.5">backend/.env</code>. The frontend only reads status and
              friendly errors.
            </p>
            <p className="mt-2">Groq API key must be stored only in backend/.env.</p>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="border-b border-border-subtle/50 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Local Backup</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">Export, import, and restore</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Last Sync</p>
              <p className="mt-2 text-sm font-semibold text-textPrimary">{lastSynced}</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Backend Time</p>
              <p className="mt-2 text-sm font-semibold text-textPrimary">{health?.timestamp || 'Unknown'}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handlePushSync} disabled={syncLoading || !health?.backendOnline} className="rounded-xl text-xs">
              Push Snapshot
            </Button>
            <Button onClick={handlePullSync} disabled={syncLoading || !health?.backendOnline} variant="outline" className="rounded-xl text-xs">
              Pull Snapshot
            </Button>
            <Button onClick={handleExport} variant="ghost" className="rounded-xl text-xs">
              Export JSON Backup
            </Button>
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-border-subtle bg-bgSurface/40 px-4 py-2 text-xs font-bold text-textPrimary transition hover:border-border-accent hover:bg-bg-glass-hover">
              Import JSON File
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="border-t border-border-subtle/50 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-textPrimary">Clear AI Mentor Chat History</span>
                <p className="mt-0.5 text-[10px] text-textMuted">Clears all saved Shayla messages.</p>
              </div>
              <Button onClick={handleClearChat} variant="outline" className="rounded-xl px-4 py-2 text-xs">
                Clear Chat
              </Button>
            </div>
          </div>

          <div className="border-t border-border-subtle/50 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-textPrimary">Clear Unlocked Badges</span>
                <p className="mt-0.5 text-[10px] text-textMuted">Resets XP levels and milestone logs.</p>
              </div>
              <Button onClick={handleClearBadges} variant="outline" className="rounded-xl px-4 py-2 text-xs">
                Reset Badges
              </Button>
            </div>
          </div>

          <div className="border-t border-border-subtle/50 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-textPrimary">Reset workspace state</span>
                <p className="mt-0.5 text-[10px] text-textMuted">Clears all local tracking data.</p>
              </div>
              <Button onClick={handleReset} variant="danger" className="rounded-xl px-4 py-2 text-xs">
                Reset State
              </Button>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <div className="flex items-center gap-3 border-b border-border-subtle/50 pb-3">
            <ShieldCheck className="h-4 w-4 text-accentYellow" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Onboarding Checklist</p>
              <h3 className="mt-1 text-lg font-semibold text-textPrimary">Setup steps to verify</h3>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {checklist.map((item) => (
              <div key={item.label} className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-textPrimary">{item.label}</p>
                  <Badge variant={item.done ? 'success' : 'neutral'}>{item.done ? 'Done' : 'Todo'}</Badge>
                </div>
                <p className="mt-2 text-xs text-textSecondary">{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
