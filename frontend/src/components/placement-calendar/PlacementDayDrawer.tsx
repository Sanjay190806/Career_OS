import React, { useState, useMemo } from 'react';
import { X, Calendar, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { PlacementDayPlan } from '../../data/placementCalendar';
import { DailyLog } from '../../types';
import { useAIStore } from '../../app/store/useAIStore';
import { useUIStore } from '../../app/store/useUIStore';
import { Button } from '../ui/Button';

interface PlacementDayDrawerProps {
  dayPlan: PlacementDayPlan | null;
  log: DailyLog | undefined;
  onClose: () => void;
  onUpdateLog: (day: number, updates: Partial<DailyLog>) => void;
}

export const PlacementDayDrawer: React.FC<PlacementDayDrawerProps> = ({
  dayPlan,
  log,
  onClose,
  onUpdateLog
}) => {
  if (!dayPlan) return null;

  const [note, setNote] = useState(log?.note || '');
  const { setCurrentDay, setActiveSection } = useUIStore();
  const queuePrompt = useAIStore((s) => s.queuePrompt);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, string[]> = {};
    dayPlan.tasks.forEach((task) => {
      const parts = task.split(':');
      if (parts.length > 1) {
        const cat = parts[0].trim();
        const content = parts.slice(1).join(':').trim();
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(content);
      } else {
        const cat = 'General Prep';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(task.trim());
      }
    });
    return groups;
  }, [dayPlan.tasks]);

  const handleSaveNote = () => {
    onUpdateLog(dayPlan.day, { note });
  };

  const handleToggleComplete = () => {
    const isCompleted = log?.status === 'completed';
    onUpdateLog(dayPlan.day, {
      status: isCompleted ? 'not_started' : 'completed',
      completionType: isCompleted ? 'missed' : 'perfect'
    });
  };

  const handleAskShayla = () => {
    const prompt = `Give me placement preparation advice and code strategy for Day ${dayPlan.day} (${dayPlan.title}). Focus: ${dayPlan.focus}. Linked tasks: ${dayPlan.tasks.join(', ')}`;
    queuePrompt(prompt);
    setActiveSection('ai');
    onClose();
  };

  const handleOpenToday = () => {
    setCurrentDay(dayPlan.day);
    setActiveSection('today');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Content panel */}
      <div className="relative w-full max-w-lg bg-bgCard border-l border-border-subtle h-full flex flex-col shadow-2xl animate-slideOver overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border-subtle p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accentBlue/10 flex items-center justify-center text-accentBlue">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-textPrimary uppercase">Day {dayPlan.day} Details</h3>
              <p className="text-[10px] text-textMuted uppercase tracking-widest">{dayPlan.phase}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-textMuted hover:text-textPrimary rounded-lg hover:bg-white/5 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto min-h-0">
          {/* Main Focus */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2">Topic & Focus</h4>
            <div className="p-4 rounded-xl border border-white/5 bg-bgSurface/40">
              <p className="text-sm font-bold text-textPrimary">{dayPlan.title}</p>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">{dayPlan.focus}</p>
            </div>
          </div>

          {/* Grouped Targets */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2.5">Today's Placement Targets</h4>
            <div className="flex flex-col gap-3">
              {Object.entries(groupedTasks).map(([category, items]) => (
                <div key={category} className="rounded-xl border border-white/5 bg-white/[0.01] p-3 flex flex-col gap-1.5">
                  <span className="text-[9px] font-bold text-accentBlue uppercase tracking-wider">{category}</span>
                  <ul className="flex flex-col gap-1 text-xs">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-textSecondary leading-normal">
                        <span className="h-1 w-1 rounded-full bg-accentBlue/70 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* LeetCode Targets */}
          {dayPlan.leetcode && dayPlan.leetcode.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2">Linked DSA Problems</h4>
              <div className="flex flex-col gap-2">
                {dayPlan.leetcode.map((problem, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-border-subtle bg-bgSurface/20 hover:bg-bgSurface/40 transition">
                    <div>
                      <span className="text-xs font-bold text-textPrimary">
                        {problem.id}. {problem.name}
                      </span>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-[9px] font-bold uppercase ${
                          problem.difficulty === 'Easy' ? 'text-accentEmerald' : problem.difficulty === 'Medium' ? 'text-accentOrange' : 'text-accentRed'
                        }`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-[9px] text-textMuted uppercase font-mono">
                          Pattern: {problem.pattern}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placement Prep Spotlight */}
          {dayPlan.placementPrep && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2">Prep Center Spotlight</h4>
              <div className="p-4 rounded-xl border border-accentPurple/20 bg-accentPurple/5">
                <div className="flex items-center gap-2 text-accentPurple mb-2">
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span className="text-xs font-bold">{dayPlan.placementPrep.type}</span>
                </div>
                <p className="text-xs text-textSecondary leading-relaxed">{dayPlan.placementPrep.details}</p>
                {dayPlan.placementPrep.what && (
                  <p className="text-xs text-textMuted mt-2 whitespace-pre-line bg-black/20 p-2.5 rounded-lg border border-white/5 font-mono">
                    {dayPlan.placementPrep.what}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Note Input */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-textMuted mb-2">Daily Execution Log / Note</h4>
            <div className="flex flex-col gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log your notes, lessons, or difficulties for today..."
                className="w-full h-24 rounded-xl border border-border-subtle bg-bgSurface p-3 text-xs text-textPrimary focus:outline-none focus:border-accentBlue resize-none"
              />
              <Button onClick={handleSaveNote} size="sm" variant="outline" className="self-end rounded-lg">
                Save Note
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border-subtle p-5 bg-bgSurface/20 flex flex-wrap gap-2.5 shrink-0">
          <Button
            onClick={handleToggleComplete}
            variant={log?.status === 'completed' ? 'outline' : 'primary'}
            className="flex-1 rounded-xl h-11 text-xs"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {log?.status === 'completed' ? 'Mark Incomplete' : 'Mark Completed'}
          </Button>

          <Button
            onClick={handleAskShayla}
            variant="outline"
            className="flex-1 rounded-xl h-11 text-xs border-accentPurple/30 text-accentPurple hover:bg-accentPurple/10"
          >
            <Sparkles className="h-4 w-4 mr-2 fill-current" />
            Ask Shayla
          </Button>

          <Button
            onClick={handleOpenToday}
            variant="ghost"
            className="w-full rounded-xl h-11 text-xs text-textSecondary hover:text-textPrimary bg-white/5 flex items-center justify-center"
          >
            Open Today Dashboard
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
