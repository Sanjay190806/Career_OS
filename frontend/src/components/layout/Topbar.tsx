import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../app/store/useUIStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getStreak } from '../../utils/xpUtils';
import { syncService } from '../../services/syncService';
import { Command, CircleCheckBig, CircleAlert, Flame, Search, Settings2 } from 'lucide-react';

interface TopbarProps {
  onOpenCommandPalette?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommandPalette }) => {
  const { activeSection, setActiveSection } = useUIStore();
  const careerState = useCareerStore((s) => s);
  const streak = getStreak(careerState);

  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      const status = await syncService.checkBackendHealth();
      if (mounted) {
        setBackendOnline(status);
      }
    };

    checkHealth();
    const timer = setInterval(checkHealth, 10000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const titleMap: Record<string, string> = {
    overview: 'Overview Dashboard',
    today: "Today's Mission",
    roadmap: '180-Day DSA Roadmap',
    ai: 'Shayla AI Mentor',
    german: 'German Learning',
    analytics: 'Analytics',
    reports: 'Reports',
    dsa_tracker: 'DSA Problems Tracker',
    skillrack: 'SkillRack Board',
    aptitude: 'Aptitude',
    sql: 'SQL Mastery Sandbox',
    cscore: 'Computer Science Core',
    projects: 'Portfolio Projects',
    resume: 'ATS Resume Builder',
    applications: 'Job Applications',
    calendar: 'Focus Mode & Calendar',
    achievements: 'Quest & Badges',
    history: 'Reflection History',
    settings: 'Settings & Backups'
  };

  return (
    <header className="shell-topbar flex h-16 shrink-0 items-center justify-between border-b border-border-subtle bg-bgSurface/80 px-4 shadow-sm backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-textMuted">Dashboard</p>
          <h1 className="truncate text-base font-semibold text-textPrimary md:text-lg">
            {titleMap[activeSection] || 'Dashboard'}
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden items-center gap-2 rounded-2xl border border-border-subtle bg-white/5 px-3 py-2 text-xs text-textSecondary transition hover:border-border-accent hover:bg-white/10 lg:flex"
          aria-label="Command palette"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="font-medium">Press Ctrl + K to search</span>
          <span className="topbar-chip ml-2 text-[10px] text-textMuted">
            <Command className="h-3 w-3" />
            K
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className={`topbar-chip text-[11px] font-medium ${backendOnline ? 'text-accentEmerald' : 'text-accentOrange'}`}>
          {backendOnline ? <CircleCheckBig className="h-3.5 w-3.5" /> : <CircleAlert className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{backendOnline ? 'Backend online' : 'Backend offline'}</span>
        </div>

        <div className="topbar-chip text-[11px] font-semibold text-accentOrange">
          <Flame className="h-3.5 w-3.5" />
          <span>{streak} day streak</span>
        </div>

        <button
          type="button"
          onClick={() => setActiveSection('settings')}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-white/5 text-textSecondary transition hover:border-border-accent hover:bg-white/10 hover:text-textPrimary"
          aria-label="Settings Page"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
