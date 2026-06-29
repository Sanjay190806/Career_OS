import React, { useState } from 'react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useUIStore } from '../../app/store/useUIStore';
import { Save, CloudLightning, Bot, Layout } from 'lucide-react';
import { awardXPForLog, getLevel } from '../../utils/xpUtils';

export const FloatingActions: React.FC = () => {
  const { dailyLogs, xp, updateDailyLog } = useCareerStore();
  const setCareerState = useCareerStore.setState;
  const { setActiveSection, currentDay } = useUIStore();


  const [saving, setSaving] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleSaveToday = () => {
    setSaving(true);
    const todayLog = dailyLogs[currentDay] || {
      counts: { leetcode: 0, skillrack: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 },
      lcStatus: [],
      note: '',
      mood: 3,
      energy: 3,
      distractions: 0,
      focusMinutes: 0,
      status: 'not_started',
      savedAt: '',
      xpEarned: 0
    };

    // Calculate XP
    const earnedXP = awardXPForLog(currentDay, todayLog);
    updateDailyLog(currentDay, {
      xpEarned: earnedXP,
      savedAt: new Date().toISOString()
    });

    const newXP = xp + earnedXP;
    const newLvl = getLevel(newXP);

    setCareerState({
      xp: newXP,
      level: newLvl.level
    });

    setTimeout(() => {
      setSaving(false);
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 2000);
    }, 600);
  };

  const handleBackup = () => {
    const stateData = useCareerStore.getState();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateData));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sanju-career-os-backup-${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 md:bottom-8 md:right-8">
      {showSavedMsg && (
        <div className="rounded-xl border border-accentEmerald/20 bg-accentEmerald px-3 py-2 text-xs font-bold text-white shadow-glow-emerald animate-bounce">
          ✓ Save Complete!
        </div>
      )}
      
      <div className="flex gap-2 bg-bgSurface/80 backdrop-blur-xl border border-border-subtle p-2 rounded-2xl shadow-glow-blue flex-wrap md:flex-nowrap justify-end max-w-[280px] md:max-w-none">
        <button
          onClick={() => setActiveSection('today')}
          title="Open Today"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-textSecondary hover:bg-white/10 hover:text-textPrimary transition"
        >
          <Layout className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={() => { setActiveSection('ai'); }}
          title="Ask Shayla"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-accentBlue hover:bg-white/10 hover:text-accentBlueLight transition"
        >
          <Bot className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={handleBackup}
          title="Backup JSON"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-textSecondary hover:bg-white/10 hover:text-textPrimary transition"
        >
          <CloudLightning className="h-4.5 w-4.5" />
        </button>

        <button
          onClick={handleSaveToday}
          disabled={saving}
          title="Save Today"
          className="flex h-9 px-3 items-center justify-center gap-1.5 rounded-xl bg-accentEmerald text-white font-bold text-xs hover:bg-accentEmeraldLight transition shadow-glow-emerald"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
};
