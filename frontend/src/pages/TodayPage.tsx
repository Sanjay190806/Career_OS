import React, { useEffect, useRef, useState } from 'react';
import { useDailyLogStore } from '../app/store/useDailyLogStore';
import { useCareerStore } from '../app/store/useCareerStore';
import { WeekStrip } from '../components/today/WeekStrip';
import { TodayHeader } from '../components/today/TodayHeader';
import { LeetCodeTaskCard } from '../components/today/LeetCodeTaskCard';
import { DailyActivityCounter } from '../components/today/DailyActivityCounter';
import { MoodEnergyPanel } from '../components/today/MoodEnergyPanel';
import { DailyReflection } from '../components/today/DailyReflection';
import { SaveDayButton } from '../components/today/SaveDayButton';
import { DailyCodingTargetPanel } from '../components/today/DailyCodingTargetPanel';
import { PomodoroTimer } from '../components/timer/PomodoroTimer';
import { DailyQuestsCard } from '../components/today/DailyQuestsCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAIStore } from '../app/store/useAIStore';
import { useUIStore } from '../app/store/useUIStore';
import { ROADMAP } from '../data/roadmap';
import { CS_SUBJECTS } from '../data/csSubjects';
import { DailyLog, ProblemLog, ActivityCounts } from '../types';
import { BookOpen, BriefcaseBusiness, HelpCircle } from 'lucide-react';
import { MobileQuickCheckIn } from '../components/mobile/MobileQuickCheckIn';
import { MobileShaylaDock } from '../components/mobile/MobileShaylaDock';
import { MobileApplicationDock } from '../components/mobile/MobileApplicationDock';
import { MiniStreakStrip } from '../components/ui/MiniStreakStrip';
import { TodayCommandCenter } from '../components/today/TodayCommandCenter';
<<<<<<< HEAD
import { getNextAction } from '../utils/applicationCrmUtils';
import { getStreak } from '../utils/xpUtils';
import { getDateForDay } from '../utils/dateUtils';
import { normalizeDailyCodingState, toLocalDateKey } from '../utils/dailyCodingUtils';
import { launchConfetti } from '../utils/confetti';
import { playAchievementFanfare, playXPDing } from '../utils/timerSounds';
=======
import { createDailyCodingState, isLeetCodeActive, type DailyCodingTaskId } from '../utils/dailyCodingTasks.mjs';
import { getDateForDay } from '../utils/dateUtils';
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)

const DEFAULT_COUNTS: ActivityCounts = {
  leetcode: 0,
  codechefJava: 0,
  skillrack: 0,
  aptitude: 0,
  sql: 0,
  cscore: 0,
  german: 0,
  project: 0,
  resume: 0,
  mockTechnical: 0,
  mockHR: 0,
  mockCoding: 0,
  mockProject: 0
};

const DEFAULT_LOG: DailyLog = {
  counts: DEFAULT_COUNTS,
  lcStatus: [],
  note: '',
  mood: 3,
  energy: 3,
  distractions: 0,
  focusMinutes: 0,
  status: 'not_started',
  savedAt: '',
  xpEarned: 0,
  freezeUsed: false,
  freezeReason: '',
  completionType: 'missed'
};

const DEFAULT_PROB_LOG: ProblemLog = {
  solved: false,
  confidence: 3,
  solveTime: 0,
  attempts: 1,
  notes: '',
  mistakeLog: '',
  revisitFlag: false
};

const triggerConfetti = (completionType?: string) => {
  // Use our canvas confetti for better visuals
  if (completionType === 'perfect') {
    launchConfetti(160);
    playAchievementFanfare(0.6);
  } else {
    launchConfetti(80);
    playXPDing(0.5);
  }
};

const isDayComplete = (log?: DailyLog) => {
  if (!log) return false;
  return log.status === 'completed' || log.completionType === 'minimum' || log.completionType === 'perfect' || log.freezeUsed === true;
};

const getNextOpenDay = (dailyLogs: Record<string, DailyLog>) => {
  let day = 1;
  while (day <= 180 && isDayComplete(dailyLogs[day])) {
    day += 1;
  }
  return Math.min(day, 180);
};

export const TodayPage: React.FC = () => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const setSelectedDay = useDailyLogStore((s) => s.setSelectedDay);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const problemLogs = useCareerStore((s) => s.problemLogs);
  const applications = useCareerStore((s) => s.applications);
  const userProfile = useCareerStore((s) => s.userProfile);
  const csCoreProgress = useCareerStore((s) => s.csCoreProgress || {});
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
<<<<<<< HEAD
  const updateDailyCodingTask = useCareerStore((s) => s.updateDailyCodingTask);
=======
  const dailyCodingByDate = useCareerStore((s) => s.dailyCodingByDate || {});
  const updateDailyCodingTaskForDay = useCareerStore((s) => s.updateDailyCodingTaskForDay);
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)
  const updateProblemLog = useCareerStore((s) => s.updateProblemLog);
  const updateCSCoreTopic = useCareerStore((s) => s.updateCSCoreTopic);
  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const setCurrentDay = useUIStore((s) => s.setCurrentDay);


  // On mount: default to the next incomplete day if the stored selection is already finished
  useEffect(() => {
    const nextOpen = getNextOpenDay(useCareerStore.getState().dailyLogs);
    const currentSel = useDailyLogStore.getState().selectedDay;
    if (nextOpen > currentSel && isDayComplete(useCareerStore.getState().dailyLogs[currentSel])) {
      setSelectedDay(nextOpen);
      setCurrentDay(nextOpen);
    }
  }, [setSelectedDay, setCurrentDay]);

  // Keep UI store's day in sync with selectedDay
  useEffect(() => {
    setCurrentDay(selectedDay);
  }, [selectedDay, setCurrentDay]);

  const currentLog = dailyLogs[selectedDay] || { ...DEFAULT_LOG, savedAt: new Date().toISOString() };
  const currentCounts = currentLog.counts || DEFAULT_COUNTS;
  const selectedDateKey = toLocalDateKey(getDateForDay(selectedDay, userProfile.startDate));
  const dailyCoding = normalizeDailyCodingState(currentLog, selectedDateKey);
  const leetcodeActive = dailyCoding.tasks.leetcode_daily.active;
  const currentProblems = ROADMAP[String(selectedDay)] || [];
<<<<<<< HEAD
  const applicationAction = applications
    .map((app) => ({ app, action: getNextAction(app) }))
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.action.urgency] - rank[b.action.urgency];
    })[0];
=======
  const selectedDateKey = getDateForDay(selectedDay, useCareerStore.getState().userProfile.startDate).toISOString().slice(0, 10);
  const dailyCodingState = dailyCodingByDate[selectedDateKey] || createDailyCodingState(selectedDateKey);
  const leetcodeActive = isLeetCodeActive(selectedDateKey);
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)

  const [activeTab, setActiveTab] = useState<'command' | 'activities'>('command');
  const [germanTrackOpen, setGermanTrackOpen] = useState(false);

  // CS Core target
  const getCSCoreTargetForDay = (day: number) => {
    const subjects = ['dbms', 'os', 'cn', 'oop'];
    const subjectId = subjects[(day - 1) % 4];
    const subject = CS_SUBJECTS.find((s) => s.id === subjectId) || CS_SUBJECTS[0];
    const topicIdx = Math.floor((day - 1) / 4) % subject.topics.length;
    const topic = subject.topics[topicIdx] || subject.topics[0];
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      topicName: topic.name,
      sampleQuestion: topic.sampleQuestion
    };
  };

  const csTarget = getCSCoreTargetForDay(selectedDay);
  const subjectProgress = csCoreProgress[csTarget.subjectId] || {};
  const topicProgress = subjectProgress[csTarget.topicName] || {
    completed: false,
    confidence: 3,
    notes: '',
    interviewReady: false,
    lastRevisedAt: null
  };

  const getProblemLog = (probIdx: number): ProblemLog => {
    const key = `d_${selectedDay}_${probIdx}`;
    return problemLogs[key] || { ...DEFAULT_PROB_LOG };
  };

  const handleSolvedChange = (probIdx: number, val: boolean) => {
    const key = `d_${selectedDay}_${probIdx}`;
    updateProblemLog(key, { solved: val });

    let newLcStatus = [...(currentLog.lcStatus || [])];
    if (val) {
      if (!newLcStatus.includes(probIdx)) newLcStatus.push(probIdx);
    } else {
      newLcStatus = newLcStatus.filter(idx => idx !== probIdx);
    }

    const newLeetcodeCount = newLcStatus.length;
    updateDailyLog(selectedDay, {
      lcStatus: newLcStatus,
      counts: {
        ...currentCounts,
        leetcode: newLeetcodeCount
      }
    });

    if (leetcodeActive) {
      updateDailyCodingTask(selectedDay, 'leetcode_daily', { count: newLeetcodeCount });
    }
  };

  const handleConfidenceChange = (probIdx: number, val: number) => {
    const key = `d_${selectedDay}_${probIdx}`;
    updateProblemLog(key, { confidence: val });
  };

  const handleNotesChange = (probIdx: number, val: string) => {
    const key = `d_${selectedDay}_${probIdx}`;
    updateProblemLog(key, { notes: val, mistakeLog: val });
  };

  const updateCount = (key: keyof ActivityCounts, direction: 'inc' | 'dec') => {
    const currentVal = currentCounts[key] || 0;
    const delta = direction === 'inc' ? 1 : -1;
    const newVal = Math.max(currentVal + delta, 0);

    updateDailyLog(selectedDay, {
      counts: {
        ...currentCounts,
        [key]: newVal
      }
    });
  };

  const updateCodingTaskCount = (taskId: DailyCodingTaskId, direction: 'inc' | 'dec') => {
    const task = dailyCodingState.tasks[taskId];
    const delta = direction === 'inc' ? 1 : -1;
    updateDailyCodingTaskForDay(selectedDay, taskId, { count: Math.max(0, task.count + delta) });
  };

  const askShayla = (prompt: string) => {
    queuePrompt(prompt);
    setActiveSection('ai');
  };

  const handleCSCoreToggle = () => {
    const nextCompleted = !topicProgress.completed;
    updateCSCoreTopic(csTarget.subjectId, csTarget.topicName, {
      completed: nextCompleted,
      lastRevisedAt: nextCompleted ? new Date().toISOString() : null
    });
    
    if (nextCompleted) {
      updateDailyLog(selectedDay, {
        counts: {
          ...currentCounts,
          cscore: (currentCounts.cscore || 0) + 1
        }
      });
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ambient particle canvas for TodayPage
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);
    const onResize = () => { if (!canvas) return; w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', onResize);

    const colors = ['#DC2626', '#3B82F6', '#EAB308', '#A855F7', '#F97316'];
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      size: Math.random() * 1.8 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.25 + 0.05
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 6; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, []);

  const careerState = useCareerStore((s) => s);
  const streak = getStreak(careerState);
  const xp = useCareerStore((s) => s.xp);
  const todayLC = currentLog.lcStatus?.length || 0;
  const todayMood = currentLog.mood || 3;
  const getMoodLabel = (m: number) => m >= 8 ? { text: 'MANIACAL 🃏', color: 'text-green-400' } : m >= 6 ? { text: 'FOCUSED 🕷️', color: 'text-blue-400' } : m >= 4 ? { text: 'STEADY 🦇', color: 'text-yellow-400' } : { text: 'GRIM 📓', color: 'text-red-400' };
  const moodInfo = getMoodLabel(todayMood);

  return (
    <div className="flex flex-col gap-5 fade-in pb-10 relative">
      {/* Ambient canvas bg */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-5">
      <WeekStrip />
      <TodayHeader />
      <MiniStreakStrip />
      <MobileQuickCheckIn />
      <MobileApplicationDock />
      <MobileShaylaDock />

      {/* ── Mission Status Pill Strip ── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-2xl border border-white/5 bg-black/50 backdrop-blur-md overflow-x-auto scrollbar-none">
        <span className="text-[8px] font-black uppercase tracking-widest text-white/25 font-mono shrink-0 hidden sm:block">Mission Status</span>
        <div className="flex-1 h-px bg-white/5 hidden sm:block" />
        <div className="flex items-center gap-1.5 shrink-0 bg-red-950/30 border border-red-900/30 px-3 py-1 rounded-full">
          <span className="text-[10px]">🕷️</span>
          <span className="text-[9px] font-black text-red-400 font-mono">Web Shots: {todayLC}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-yellow-950/30 border border-yellow-900/30 px-3 py-1 rounded-full">
          <span className="text-[10px]">🦇</span>
          <span className="text-[9px] font-black text-yellow-400 font-mono">Streak: {streak}d</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-purple-950/30 border border-purple-900/30 px-3 py-1 rounded-full">
          <span className="text-[10px]">🃏</span>
          <span className={`text-[9px] font-black font-mono ${moodInfo.color}`}>Mood: {moodInfo.text}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-orange-950/30 border border-orange-900/30 px-3 py-1 rounded-full">
          <span className="text-[10px]">🍥</span>
          <span className="text-[9px] font-black text-orange-400 font-mono">XP: {xp}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-blue-950/30 border border-blue-900/30 px-3 py-1 rounded-full">
          <span className="text-[10px]">📓</span>
          <span className="text-[9px] font-black text-blue-300 font-mono">Day {selectedDay}/180</span>
        </div>
      </div>

      {/* ── Cinematic Hero Tabs ── */}
      <div className="relative flex border border-white/5 rounded-2xl p-1 text-xs font-black uppercase tracking-wider self-start select-none bg-black/60 backdrop-blur-md overflow-hidden">
        {/* Tab background glow */}
        <div className={`absolute inset-0 transition-all duration-500 rounded-2xl pointer-events-none ${
          activeTab === 'command' ? 'bg-gradient-to-r from-red-950/30 via-blue-950/20 to-transparent' : 'bg-gradient-to-l from-yellow-950/20 via-purple-950/15 to-transparent'
        }`} />
        <button
          onClick={() => setActiveTab('command')}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
            activeTab === 'command'
              ? 'bg-gradient-to-r from-red-700/40 to-blue-700/30 text-white shadow-[0_0_14px_rgba(220,38,38,0.25),0_0_6px_rgba(59,130,246,0.15)] border border-red-600/20'
              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          <span className="text-sm">🕷️</span>
          <span>Command Center</span>
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 ${
            activeTab === 'activities'
              ? 'bg-gradient-to-r from-yellow-700/30 to-yellow-600/20 text-yellow-300 shadow-[0_0_14px_rgba(234,179,8,0.2)] border border-yellow-600/20'
              : 'text-white/40 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          <span className="text-sm">🦇</span>
          <span>Activity Loggers</span>
        </button>
      </div>

      {activeTab === 'command' ? (
        <div className="flex flex-col gap-4">
          {applicationAction && (
            <Card className="border-accentBlue/20 bg-accentBlue/5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-accentBlue/10 p-2 text-accentBlue">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Application Action</p>
                    <h3 className="mt-1 text-sm font-semibold text-textPrimary">{applicationAction.app.company} - {applicationAction.action.label}</h3>
                    <p className="mt-1 max-w-2xl text-xs text-textSecondary">{applicationAction.action.reason}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveSection('applications');
                    window.history.pushState({}, '', '/applications');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                >
                  Open CRM
                </Button>
              </div>
            </Card>
          )}
          <TodayCommandCenter />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Daily coding task checklist */}
          <div className="lg:col-span-2 flex flex-col gap-4">
<<<<<<< HEAD
            <DailyCodingTargetPanel />

            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider pl-1 mt-4">LeetCode Challenges</h3>
            {!leetcodeActive ? (
              <Card className="border-white/5 bg-white/[0.01] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-textMuted">Scheduled from Aug 1, 2026</p>
                    <h4 className="mt-1 text-sm font-semibold text-textPrimary">LeetCode starts Aug 1</h4>
                  </div>
                  <Badge variant="neutral">Inactive Today</Badge>
                </div>
              </Card>
=======
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider pl-1">Daily Coding</h3>
            <Card className="grid gap-3 border-accentBlue/20 bg-accentBlue/5 p-4 md:grid-cols-3">
              {(['codechef_java_daily', 'skillrack_daily'] as DailyCodingTaskId[]).map((taskId) => {
                const task = dailyCodingState.tasks[taskId];
                return (
                  <div key={task.id} className="rounded-xl border border-white/5 bg-black/25 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-textMuted">{task.label} Daily</p>
                        <p className="mt-1 text-xs text-textSecondary">Target: {task.target} {taskId === 'codechef_java_daily' ? 'Java problems' : 'problems'}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(event) => updateDailyCodingTaskForDay(selectedDay, task.id, { completed: event.target.checked })}
                        className="mt-0.5 rounded border-white/10 bg-black/45 text-accentBlue focus:ring-0"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono text-lg font-black text-textPrimary">{task.count}/{task.target}</span>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => updateCodingTaskCount(task.id, 'dec')} className="h-7 w-7 p-0">-</Button>
                        <Button size="sm" variant="outline" onClick={() => updateCodingTaskCount(task.id, 'inc')} className="h-7 w-7 p-0">+</Button>
                      </div>
                    </div>
                    <Badge variant={task.completed ? 'success' : 'neutral'}>{task.completed ? 'Complete' : 'Pending'}</Badge>
                  </div>
                );
              })}
              <div className="rounded-xl border border-white/5 bg-black/25 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-textMuted">LeetCode</p>
                <p className="mt-1 text-xs text-textSecondary">
                  {leetcodeActive ? 'Active from official DSA start' : 'Starts on Aug 1, 2026'}
                </p>
                <Badge variant={leetcodeActive ? 'primary' : 'neutral'}>{leetcodeActive ? 'Active' : 'Scheduled'}</Badge>
              </div>
            </Card>

            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider pl-1 mt-4">LeetCode Challenges</h3>
            {!leetcodeActive ? (
              <div className="glass-card p-6 text-center text-textSecondary text-xs">
                LeetCode starts on Aug 1, 2026. It is not required for today's coding completion before the official DSA restart.
              </div>
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)
            ) : currentProblems.length === 0 ? (
              <div className="glass-card p-6 text-center text-textSecondary text-xs">
                No specific LeetCode problems scheduled for Day {selectedDay}. Rest/recovery focus study day.
              </div>
            ) : (
              currentProblems.map((prob, index) => {
                const probLog = getProblemLog(index);
                return (
                  <LeetCodeTaskCard
                    key={index}
                    problem={prob}
                    problemIndex={index}
                    solved={probLog.solved}
                    confidence={probLog.confidence}
                    notes={probLog.notes}
                    onSolvedChange={(val) => handleSolvedChange(index, val)}
                    onConfidenceChange={(val) => handleConfidenceChange(index, val)}
                    onNotesChange={(val) => handleNotesChange(index, val)}
                  />
                );
              })
            )}

            {/* CS Core Daily Target Card */}
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider pl-1 mt-4">CS Core Mission</h3>
            <Card className="flex flex-col gap-4 border-accentBlue/20 bg-accentBlue/5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-accentBlue/10 p-2 text-accentBlue">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider">
                      {csTarget.subjectName} Subject Rotation
                    </span>
                    <h4 className="text-base font-semibold text-textPrimary">{csTarget.topicName}</h4>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={topicProgress.interviewReady ? 'success' : 'neutral'}>
                    {topicProgress.interviewReady ? 'Interview Ready' : 'Preparing'}
                  </Badge>
                  <Badge variant={topicProgress.completed ? 'primary' : 'neutral'}>
                    {topicProgress.completed ? 'Revised' : 'Pending'}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-textSecondary">{csTarget.sampleQuestion}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="rounded-xl border border-border-subtle bg-white/[0.02] p-3 flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-textMuted uppercase">Set Confidence</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        onClick={() => updateCSCoreTopic(csTarget.subjectId, csTarget.topicName, { confidence: val })}
                        className={`h-7 w-7 rounded-lg border text-xs font-semibold transition ${
                          topicProgress.confidence === val
                            ? 'border-accentBlue bg-accentBlue/25 text-textPrimary'
                            : 'border-white/5 hover:border-white/10 text-textMuted'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border-subtle bg-white/[0.02] p-3 flex flex-col gap-2">
                  <span className="text-[10px] font-semibold text-textMuted uppercase">Interview Readiness</span>
                  <Button
                    size="sm"
                    variant={topicProgress.interviewReady ? 'secondary' : 'outline'}
                    onClick={() => updateCSCoreTopic(csTarget.subjectId, csTarget.topicName, { interviewReady: !topicProgress.interviewReady })}
                    className="w-full text-xs h-[30px]"
                  >
                    {topicProgress.interviewReady ? 'Unset Interview Ready' : 'Mark Interview Ready'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <span className="text-[10px] font-semibold text-textMuted uppercase">Syllabus Revision Notes</span>
                <textarea
                  value={topicProgress.notes || ''}
                  onChange={(e) => updateCSCoreTopic(csTarget.subjectId, csTarget.topicName, { notes: e.target.value })}
                  placeholder="Key terms, normalizations, ACID, complexities..."
                  className="w-full min-h-[60px] rounded-lg border border-border-subtle bg-bgSurface/40 px-3 py-2 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-accentBlue"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={topicProgress.completed ? 'primary' : 'outline'}
                    onClick={handleCSCoreToggle}
                    className="text-xs"
                  >
                    {topicProgress.completed ? '✓ Revised topic' : 'Mark revised'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => askShayla(`Explain the CS Core topic "${csTarget.topicName}" for my placement prep.`)}
                    className="text-xs text-accentBlue"
                  >
                    <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
                    Ask Shayla to Explain
                  </Button>
                </div>
              </div>
            </Card>

            {/* Activity counters grid */}
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider pl-1 mt-4">Placement Prep Schedules</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <DailyActivityCounter
<<<<<<< HEAD
=======
                label="CodeChef Java"
                emoji="CJ"
                value={dailyCodingState.tasks.codechef_java_daily.count}
                target={5}
                unit="problems"
                color="#F97316"
                onIncrement={() => updateCodingTaskCount('codechef_java_daily', 'inc')}
                onDecrement={() => updateCodingTaskCount('codechef_java_daily', 'dec')}
              />
              <DailyActivityCounter
                label="SkillRack"
                emoji="⚡"
                value={dailyCodingState.tasks.skillrack_daily.count}
                target={5}
                unit="problems"
                color="#3B82F6"
                onIncrement={() => updateCodingTaskCount('skillrack_daily', 'inc')}
                onDecrement={() => updateCodingTaskCount('skillrack_daily', 'dec')}
              />
              <DailyActivityCounter
>>>>>>> da90b03 (docs: upgrade README with architecture and setup guide)
                label="Aptitude"
                emoji="🧮"
                value={currentCounts.aptitude || 0}
                target={30}
                unit="minutes"
                color="#8B5CF6"
                onIncrement={() => updateCount('aptitude', 'inc')}
                onDecrement={() => updateCount('aptitude', 'dec')}
              />
              <DailyActivityCounter
                label="SQL Practice"
                emoji="🗄️"
                value={currentCounts.sql || 0}
                target={5}
                unit="queries"
                color="#06B6D4"
                onIncrement={() => updateCount('sql', 'inc')}
                onDecrement={() => updateCount('sql', 'dec')}
              />
              <DailyActivityCounter
                label="CS Core"
                emoji="📚"
                value={currentCounts.cscore || 0}
                target={1}
                unit="topics"
                color="#F43F5E"
                onIncrement={() => updateCount('cscore', 'inc')}
                onDecrement={() => updateCount('cscore', 'dec')}
              />
              <DailyActivityCounter
                label="Project Code"
                emoji="🚀"
                value={currentCounts.project || 0}
                target={30}
                unit="minutes"
                color="#EAB308"
                onIncrement={() => updateCount('project', 'inc')}
                onDecrement={() => updateCount('project', 'dec')}
              />
            </div>

            {/* Optional German Study Track Expander */}
            <Card className="mt-3 border-white/5 bg-white/[0.01] p-3 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setGermanTrackOpen(!germanTrackOpen)}
                className="flex w-full items-center justify-between text-left text-[10px] font-bold text-textSecondary uppercase tracking-widest hover:text-accentEmerald transition"
              >
                <span className="flex items-center gap-1.5">🇩🇪 A1-B1 German Study Track (Optional)</span>
                <span className="text-textMuted text-[9px]">{germanTrackOpen ? 'Collapse [-]' : 'Expand [+]'}</span>
              </button>
              
              {germanTrackOpen && (
                <div className="pt-2 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DailyActivityCounter
                    label="German Study"
                    emoji="🇩🇪"
                    value={currentCounts.german || 0}
                    target={20}
                    unit="minutes"
                    color="#10B981"
                    onIncrement={() => updateCount('german', 'inc')}
                    onDecrement={() => updateCount('german', 'dec')}
                  />
                  <div className="flex flex-col justify-center text-[10px] text-textMuted leading-relaxed">
                    <p>• Log vocabulary practice and German academy target lessons.</p>
                    <p>• Optional tracking: Does not penalize standard placement streak targets.</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Mock Interview Counters */}
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider pl-1 mt-4">Mock Interview Daily Counters</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <DailyActivityCounter
                label="Technical Mock"
                emoji="🤝"
                value={currentCounts.mockTechnical || 0}
                target={1}
                unit="sessions"
                color="#10B981"
                onIncrement={() => updateCount('mockTechnical', 'inc')}
                onDecrement={() => updateCount('mockTechnical', 'dec')}
                compact={true}
              />
              <DailyActivityCounter
                label="HR Mock"
                emoji="💬"
                value={currentCounts.mockHR || 0}
                target={1}
                unit="sessions"
                color="#F97316"
                onIncrement={() => updateCount('mockHR', 'inc')}
                onDecrement={() => updateCount('mockHR', 'dec')}
                compact={true}
              />
              <DailyActivityCounter
                label="Coding Mock"
                emoji="💻"
                value={currentCounts.mockCoding || 0}
                target={1}
                unit="sessions"
                color="#8B5CF6"
                onIncrement={() => updateCount('mockCoding', 'inc')}
                onDecrement={() => updateCount('mockCoding', 'dec')}
                compact={true}
              />
              <DailyActivityCounter
                label="Project Mock"
                emoji="💡"
                value={currentCounts.mockProject || 0}
                target={1}
                unit="sessions"
                color="#EAB308"
                onIncrement={() => updateCount('mockProject', 'inc')}
                onDecrement={() => updateCount('mockProject', 'dec')}
                compact={true}
              />
            </div>
          </div>

          {/* Right Sidebar panels */}
          <div className="flex flex-col gap-6">
            {/* ⏱️ Cinematic Pomodoro Timer */}
            <PomodoroTimer onWorkSessionComplete={(minutes) => updateDailyLog(selectedDay, { focusMinutes: (currentLog.focusMinutes || 0) + minutes })} />

            {/* 🏆 Daily Quests Dashboard */}
            <DailyQuestsCard />

            <MoodEnergyPanel
              mood={currentLog.mood}
              energy={currentLog.energy}
              distractions={currentLog.distractions || 0}
              onMoodChange={(val) => updateDailyLog(selectedDay, { mood: val })}
              onEnergyChange={(val) => updateDailyLog(selectedDay, { energy: val })}
              onDistractionsChange={(val) => updateDailyLog(selectedDay, { distractions: val })}
            />

            <DailyReflection
              note={currentLog.note || ''}
              onNoteChange={(val) => updateDailyLog(selectedDay, { note: val })}
            />

            <SaveDayButton onSave={() => triggerConfetti(currentLog.completionType)} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
export default TodayPage;
