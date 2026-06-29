import React, { useState, useMemo } from 'react';
import { useDailyLogStore } from '../app/store/useDailyLogStore';
import { useCareerStore } from '../app/store/useCareerStore';
import { WeekStrip } from '../components/today/WeekStrip';
import { TodayHeader } from '../components/today/TodayHeader';
import { LeetCodeTaskCard } from '../components/today/LeetCodeTaskCard';
import { DailyActivityCounter } from '../components/today/DailyActivityCounter';
import { MoodEnergyPanel } from '../components/today/MoodEnergyPanel';
import { DailyReflection } from '../components/today/DailyReflection';
import { FocusTimer } from '../components/today/FocusTimer';
import { SaveDayButton } from '../components/today/SaveDayButton';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAIStore } from '../app/store/useAIStore';
import { useUIStore } from '../app/store/useUIStore';
import { useAISettingsStore } from '../app/store/useAISettingsStore';
import { useShaylaAgentStore } from '../app/store/useShaylaAgentStore';
import { ROADMAP } from '../data/roadmap';
import { CS_SUBJECTS } from '../data/csSubjects';
import { DailyLog, ProblemLog, ActivityCounts } from '../types';
import { awardXPForLog, getLevel } from '../utils/xpUtils';
import { BookOpen, HelpCircle, Flame, Star, Snowflake, ShieldCheck } from 'lucide-react';
import { buildAgentContext } from '../utils/agentContextUtils';
import { generateDailyBriefing, generateEveningReview } from '../services/agentService';
import { ShaylaBriefingResult } from '../types/shaylaAgent';
import { MobileQuickCheckIn } from '../components/mobile/MobileQuickCheckIn';
import { MobileShaylaDock } from '../components/mobile/MobileShaylaDock';
import { getFreezesLeftForWeek, canUseFreeze } from '../utils/streakFreezeUtils';
import { getMinimumChecklist, getPerfectChecklist } from '../utils/dailyCompletionUtils';
import { MiniStreakStrip } from '../components/ui/MiniStreakStrip';

const DEFAULT_COUNTS: ActivityCounts = {
  leetcode: 0,
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

const triggerConfetti = () => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const colors = ['#58cc02', '#ffd43b', '#ff9f1c', '#38bdf8', '#a78bfa'];
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('div');
    p.style.position = 'absolute';
    p.style.top = '-20px';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.width = Math.random() * 8 + 6 + 'px';
    p.style.height = Math.random() * 12 + 8 + 'px';
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.borderRadius = '3px';
    p.style.opacity = (Math.random() * 0.4 + 0.6).toString();
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    const duration = Math.random() * 1.5 + 1.5;
    p.style.transition = `transform ${duration}s linear, top ${duration}s linear, opacity ${duration}s linear`;
    container.appendChild(p);

    setTimeout(() => {
      p.style.top = '105vh';
      p.style.transform = `rotate(${Math.random() * 720}deg) translateX(${Math.random() * 100 - 50}px)`;
      p.style.opacity = '0';
    }, 50);
  }

  setTimeout(() => container.remove(), 4000);
};

export const TodayPage: React.FC = () => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const problemLogs = useCareerStore((s) => s.problemLogs);
  const csCoreProgress = useCareerStore((s) => s.csCoreProgress || {});
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
  const updateProblemLog = useCareerStore((s) => s.updateProblemLog);
  const updateCSCoreTopic = useCareerStore((s) => s.updateCSCoreTopic);
  const useStreakFreeze = useCareerStore((s) => s.useStreakFreeze);
  const weeklyFreezeUsage = useCareerStore((s) => s.weeklyFreezeUsage || {});
  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const aiSettings = useAISettingsStore((s) => s);
  const agentStore = useShaylaAgentStore((s) => s);
  
  const xp = useCareerStore((s) => s.xp);
  const userProfile = useCareerStore((s) => s.userProfile);
  const setCareerState = useCareerStore.setState;

  const currentLog = dailyLogs[selectedDay] || { ...DEFAULT_LOG, savedAt: new Date().toISOString() };
  const currentCounts = currentLog.counts || DEFAULT_COUNTS;
  const currentProblems = ROADMAP[String(selectedDay)] || [];

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [briefing, setBriefing] = useState<ShaylaBriefingResult | null>(null);
  const [eveningReview, setEveningReview] = useState<ShaylaBriefingResult | null>(null);
  const [freezeReasonText, setFreezeReasonText] = useState(currentLog.freezeReason || '');
  const [germanTrackOpen, setGermanTrackOpen] = useState(false);
  const [briefingCollapsed, setBriefingCollapsed] = useState(true);

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

  // Recent 20 Notes Drawer list helper
  const recentNotes = useMemo(() => {
    return Object.entries(dailyLogs)
      .map(([dayNum, log]) => ({ dayNum: Number(dayNum), note: log.note || '' }))
      .filter((n) => n.note.trim().length > 0)
      .sort((a, b) => b.dayNum - a.dayNum)
      .slice(0, 20);
  }, [dailyLogs]);

  // Minimum / Perfect Day dynamic progress checks
  const minDayQualified = useMemo(() => {
    const lcSolved = (currentLog.lcStatus?.length || 0);
    const skillrack = currentCounts.skillrack || 0;
    const aptitude = currentCounts.aptitude || 0;
    const sql = currentCounts.sql || 0;
    const cs = currentCounts.cscore || 0;

    const hasCoding = skillrack >= 5 || lcSolved >= 1 || (currentCounts.leetcode || 0) >= 1;
    const hasApt = aptitude >= 20;
    const hasSqlOrCs = sql >= 1 || cs >= 1 || topicProgress.completed;

    return hasCoding && hasApt && hasSqlOrCs;
  }, [currentLog, currentCounts, topicProgress]);

  const perfectDayQualified = useMemo(() => {
    const lcSolved = (currentLog.lcStatus?.length || 0);
    const skillrack = currentCounts.skillrack || 0;
    const aptitude = currentCounts.aptitude || 0;
    const sql = currentCounts.sql || 0;
    const cs = currentCounts.cscore || 0;

    return lcSolved >= 2 && skillrack >= 10 && aptitude >= 30 && sql >= 5 && cs >= 1;
  }, [currentLog, currentCounts]);

  const minDayChecklist = useMemo(() => getMinimumChecklist(currentLog), [currentLog]);
  const perfectDayChecklist = useMemo(() => getPerfectChecklist(currentLog), [currentLog]);

  const recoveryChallengeActive = useMemo(() => {
    if (selectedDay <= 1) return false;
    const prevLog = dailyLogs[selectedDay - 1];
    return !!(prevLog && prevLog.freezeUsed);
  }, [dailyLogs, selectedDay]);

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

  const handleApplyStreakFreeze = () => {
    const dateObj = new Date(userProfile.startDate);
    dateObj.setDate(dateObj.getDate() + (selectedDay - 1));
    
    if (!canUseFreeze(dateObj, weeklyFreezeUsage)) {
      setToastMsg("Streak Freeze limit reached for this week!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }

    useStreakFreeze(selectedDay, freezeReasonText);
    setToastMsg("Streak freeze applied! Streak protected.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleSave = () => {
    // 1. Calculate completion Type
    let type: DailyLog['completionType'] = 'missed';
    let newStatus: DailyLog['status'] = 'missed';

    if (currentLog.freezeUsed) {
      type = 'freeze';
      newStatus = 'recovery';
    } else if (perfectDayQualified) {
      type = 'perfect';
      newStatus = 'completed';
    } else if (minDayQualified) {
      type = 'minimum';
      newStatus = 'completed';
    } else if (Object.values(currentCounts).some(v => v > 0) || currentLog.lcStatus?.length > 0) {
      type = 'partial';
      newStatus = 'partial';
    }

    // 2. Calculate XP
    const testLog = { ...currentLog, completionType: type, status: newStatus };
    const calculatedXP = awardXPForLog(selectedDay, testLog);

    updateDailyLog(selectedDay, {
      status: newStatus,
      completionType: type,
      xpEarned: calculatedXP,
      savedAt: new Date().toISOString()
    });

    // Update cumulative XP
    const newCumulativeXP = xp + calculatedXP;
    const newLevelObj = getLevel(newCumulativeXP);

    setCareerState({
      xp: newCumulativeXP,
      level: newLevelObj.level
    });

    if (type === 'perfect' || type === 'minimum') {
      triggerConfetti();
    }

    setToastMsg(`Saved successfully! ${type.toUpperCase()} Day Quest completed. Earned +${calculatedXP} XP.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSessionComplete = (minutes: number) => {
    const currentFocus = currentLog.focusMinutes || 0;
    updateDailyLog(selectedDay, {
      focusMinutes: currentFocus + minutes
    });
  };

  const askShayla = (prompt: string) => {
    queuePrompt(prompt);
    setActiveSection('ai');
  };

  const generateAgentBriefing = async (kind: 'morning' | 'recovery' | 'evening') => {
    setAgentLoading(true);
    try {
      const context = buildAgentContext(useCareerStore.getState(), selectedDay);
      const aiBody = {
        provider: aiSettings.activeProvider,
        model: aiSettings.activeModel,
        mode: aiSettings.activeMode,
        streaming: aiSettings.streamingEnabled,
      };

      if (kind === 'evening') {
        const result = await generateEveningReview(context, aiBody);
        setEveningReview(result);
        agentStore.recordEveningReview({
          id: `review-${Date.now()}`,
          kind: 'evening',
          title: result.title,
          summary: result.summary,
          generatedAt: result.generatedAt,
          fallbackUsed: result.fallbackUsed,
        });
        return;
      }

      const result = await generateDailyBriefing(kind, context, aiBody);
      setBriefing(result);
      agentStore.recordBriefing({
        id: `briefing-${Date.now()}`,
        kind,
        title: result.title,
        summary: result.summary,
        generatedAt: result.generatedAt,
        fallbackUsed: result.fallbackUsed,
      });
    } finally {
      setAgentLoading(false);
    }
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

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 right-6 z-50 bg-accentEmerald border border-accentEmerald/20 px-4 py-3 rounded-xl shadow-glow-emerald text-xs font-bold text-white flex items-center gap-2 animate-toastIn">
          <span>✓</span> {toastMsg}
        </div>
      )}

      {/* Week Calendar strip */}
      <WeekStrip />

      {/* Title & topic header */}
      <TodayHeader />

      {/* 28-day Streak Strip */}
      <MiniStreakStrip />

      <MobileQuickCheckIn />
      <MobileShaylaDock />

      {/* Minimum / Perfect Day Progress indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`p-4 border border-white/5 flex justify-between items-center ${minDayQualified ? 'bg-accentEmerald/10 border-accentEmerald/20' : 'bg-white/[0.02]'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${minDayQualified ? 'bg-accentEmerald/10 text-accentEmerald' : 'bg-white/5 text-textMuted'}`}>
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-textPrimary text-sm">Minimum Day Target</h4>
              <p className="text-[10px] text-textMuted mt-0.5">5 SkillRack OR 1 LeetCode + 20m Aptitude + SQL/CS</p>
            </div>
          </div>
          <Badge variant={minDayQualified ? 'success' : 'neutral'}>
            {minDayQualified ? 'Qualified' : 'Pending'}
          </Badge>
        </Card>

        <Card className={`p-4 border border-white/5 flex justify-between items-center ${perfectDayQualified ? 'bg-accentGold/10 border-accentGold/20' : 'bg-white/[0.02]'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${perfectDayQualified ? 'bg-accentGold/10 text-accentGold' : 'bg-white/5 text-textMuted'}`}>
              <Star className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-textPrimary text-sm">Perfect Day Target</h4>
              <p className="text-[10px] text-textMuted mt-0.5">10 SkillRack + 2 LeetCode + 30m Apt + 5 SQL + CS Core</p>
            </div>
          </div>
          <Badge variant={perfectDayQualified ? 'warning' : 'neutral'}>
            {perfectDayQualified ? 'Perfect Day Achieved' : 'Pending'}
          </Badge>
        </Card>
      </div>

      {/* Missing Items Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Day Checklist */}
        <Card className="p-4 border border-white/5 bg-bgSurface/20">
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-2.5">Minimum Day Status Checklist</h4>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${minDayChecklist.dsa ? 'bg-accentEmerald' : 'bg-red-500'}`} />
              <span className={minDayChecklist.dsa ? 'text-textSecondary line-through opacity-60' : 'text-textPrimary font-semibold'}>
                Coding Target: 5 SkillRack OR 1 LeetCode OR 30m Java DSA
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${minDayChecklist.aptitude ? 'bg-accentEmerald' : 'bg-red-500'}`} />
              <span className={minDayChecklist.aptitude ? 'text-textSecondary line-through opacity-60' : 'text-textPrimary font-semibold'}>
                Aptitude Target: 20-30 min practice ({currentCounts.aptitude || 0} / 20m)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${minDayChecklist.sqlOrCs ? 'bg-accentEmerald' : 'bg-red-500'}`} />
              <span className={minDayChecklist.sqlOrCs ? 'text-textSecondary line-through opacity-60' : 'text-textPrimary font-semibold'}>
                SQL / CS Core Target: 15 min SQL OR 1 CS Core topic ({currentCounts.sql || 0}m SQL, {currentCounts.cscore || 0} CS Core)
              </span>
            </div>
          </div>
        </Card>

        {/* Perfect Day Checklist */}
        <Card className="p-4 border border-white/5 bg-bgSurface/20">
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-2.5">Perfect Day Status Checklist</h4>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${perfectDayChecklist.leetcode ? 'bg-accentEmerald' : 'bg-red-500'}`} />
              <span className={perfectDayChecklist.leetcode ? 'text-textSecondary line-through opacity-60' : 'text-textPrimary'}>
                2 LeetCode problems ({currentCounts.leetcode || 0} / 2)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${perfectDayChecklist.skillrack ? 'bg-accentEmerald' : 'bg-red-500'}`} />
              <span className={perfectDayChecklist.skillrack ? 'text-textSecondary line-through opacity-60' : 'text-textPrimary'}>
                10 SkillRack problems ({currentCounts.skillrack || 0} / 10)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${perfectDayChecklist.aptitude ? 'bg-accentEmerald' : 'bg-red-500'}`} />
              <span className={perfectDayChecklist.aptitude ? 'text-textSecondary line-through opacity-60' : 'text-textPrimary'}>
                30 aptitude questions or 30 mins ({currentCounts.aptitude || 0} / 30)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${perfectDayChecklist.sql ? 'bg-accentEmerald' : 'bg-red-500'}`} />
              <span className={perfectDayChecklist.sql ? 'text-textSecondary line-through opacity-60' : 'text-textPrimary'}>
                5 SQL queries or 30 mins SQL ({currentCounts.sql || 0} / 30)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${perfectDayChecklist.csCore ? 'bg-accentEmerald' : 'bg-red-500'}`} />
              <span className={perfectDayChecklist.csCore ? 'text-textSecondary line-through opacity-60' : 'text-textPrimary'}>
                1 CS Core topic ({currentCounts.cscore || 0} / 1)
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recovery challenge card */}
      {recoveryChallengeActive && (
        <Card className="border-accentOrange/30 bg-accentOrange/5 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-accentOrange">
            <Flame className="h-5 w-5 animate-pulse" />
            <h3 className="text-base font-bold text-textPrimary">Next-Day Recovery Challenge Active!</h3>
          </div>
          <p className="text-xs text-textSecondary leading-relaxed">
            Your yesterday was protected by a Streak Freeze. Complete these targets today to rebuild consistency momentum:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mt-1">
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-xl">
              <span className={`h-2 w-2 rounded-full ${currentCounts.skillrack >= 15 ? 'bg-accentEmerald' : 'bg-accentOrange'}`} />
              <span className="text-textSecondary">15 SkillRack ({currentCounts.skillrack || 0} / 15)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-xl">
              <span className={`h-2 w-2 rounded-full ${currentCounts.leetcode >= 2 ? 'bg-accentEmerald' : 'bg-accentOrange'}`} />
              <span className="text-textSecondary">2 LeetCode ({currentCounts.leetcode || 0} / 2)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-xl">
              <span className={`h-2 w-2 rounded-full ${currentCounts.aptitude >= 45 ? 'bg-accentEmerald' : 'bg-accentOrange'}`} />
              <span className="text-textSecondary">45m Aptitude ({currentCounts.aptitude || 0} / 45m)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-xl">
              <span className={`h-2 w-2 rounded-full ${currentCounts.cscore >= 1 ? 'bg-accentEmerald' : 'bg-accentOrange'}`} />
              <span className="text-textSecondary">1 CS Core topic ({currentCounts.cscore || 0} / 1)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-xl">
              <span className={`h-2 w-2 rounded-full ${currentCounts.sql >= 1 ? 'bg-accentEmerald' : 'bg-accentOrange'}`} />
              <span className="text-textSecondary">1 SQL target ({currentCounts.sql || 0} / 1)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-xl">
              <span className={`h-2 w-2 rounded-full ${currentCounts.german >= 1 ? 'bg-accentEmerald' : 'bg-accentOrange'}`} />
              <span className="text-textSecondary">1 German Lesson ({currentCounts.german || 0} / 1)</span>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LeetCode task checklist */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider pl-1">LeetCode Challenges</h3>
          {currentProblems.length === 0 ? (
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
              label="SkillRack"
              emoji="⚡"
              value={currentCounts.skillrack || 0}
              target={10}
              unit="problems"
              color="#3B82F6"
              onIncrement={() => updateCount('skillrack', 'inc')}
              onDecrement={() => updateCount('skillrack', 'dec')}
            />
            <DailyActivityCounter
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
          {/* Streak Freeze Card */}
          <Card className="border-accentBlue/20 bg-accentBlue/5 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-accentBlue">
              <Snowflake className="h-5 w-5" />
              <h3 className="text-base font-bold text-textPrimary">Streak Freeze Protection</h3>
            </div>
            <p className="text-[11px] text-textSecondary">
              Use 1 freeze per calendar week to protect your streak. Reason can be logged.
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Reason (optional)..."
                value={freezeReasonText}
                onChange={(e) => setFreezeReasonText(e.target.value)}
                className="w-full h-8 px-2 rounded-lg border border-border-subtle bg-bgSurface/60 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none"
              />
              <Button size="sm" onClick={handleApplyStreakFreeze} className="w-full gap-1 text-xs">
                <ShieldCheck className="h-4 w-4" />
                Use Freeze Today ({getFreezesLeftForWeek(new Date(), weeklyFreezeUsage)} left)
              </Button>
            </div>
          </Card>

          <Card className="border-accentEmerald/20 bg-accentEmerald/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accentEmerald">Agent Mission</p>
            <h3 className="mt-1 text-base font-semibold text-textPrimary">Daily briefing controls</h3>
            <div className="mt-3 grid gap-2">
              <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('morning')} disabled={agentLoading}>
                Generate Morning Brief
              </Button>
              <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('recovery')} disabled={agentLoading}>
                Generate Recovery Plan
              </Button>
              <Button size="sm" variant="ghost" onClick={() => generateAgentBriefing('evening')} disabled={agentLoading}>
                Generate Evening Review
              </Button>
            </div>
            {(briefing || eveningReview) && (
              <div className="mt-4 rounded-2xl border border-border-subtle bg-bgSurface/40 p-3 text-xs text-textSecondary flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-1 select-none">
                  <p className="font-semibold text-textPrimary truncate">{briefing?.title || eveningReview?.title}</p>
                  <button 
                    type="button"
                    onClick={() => setBriefingCollapsed(!briefingCollapsed)}
                    className="text-[9px] font-bold text-accentBlue hover:underline ml-2"
                  >
                    {briefingCollapsed ? 'Expand' : 'Collapse'}
                  </button>
                </div>
                <p className={`mt-1 leading-relaxed ${briefingCollapsed ? 'line-clamp-4' : 'whitespace-pre-wrap'}`}>
                  {briefing?.summary || eveningReview?.summary}
                </p>
              </div>
            )}
          </Card>

          <Card className="border-accentPurple/20 bg-accentPurple/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accentPurple">Shayla Mission Coach</p>
            <h3 className="mt-1 text-base font-semibold text-textPrimary">Today rescue panel</h3>
            <div className="mt-3 grid gap-2">
              <Button size="sm" variant="ghost" onClick={() => askShayla(`Explain today's DSA pattern for Day ${selectedDay}.`)}>
                Explain today's DSA pattern
              </Button>
              <Button size="sm" variant="ghost" onClick={() => askShayla(`Give me a hint only for today's first DSA problem in Java.`)}>
                Give hint only
              </Button>
              <Button size="sm" variant="ghost" onClick={() => askShayla(`Create a recovery plan for Day ${selectedDay}.`)}>
                Create recovery plan
              </Button>
              <Button size="sm" variant="ghost" onClick={() => askShayla('Motivate me to finish today.')}>
                Motivate me to finish today
              </Button>
            </div>
          </Card>

          <FocusTimer onSessionComplete={handleSessionComplete} />
          
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

          {/* Recent Notes Drawer list */}
          <Card className="p-4 border-white/5">
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-2">Recent Notes</h4>
            {recentNotes.length === 0 ? (
              <p className="text-[10px] text-textMuted">No notes written yet.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                {recentNotes.map((rn) => (
                  <div
                    key={rn.dayNum}
                    className="p-2 bg-white/5 border border-white/5 rounded-lg text-[10px] cursor-pointer hover:border-accentBlue/30 hover:bg-white/10"
                  >
                    <span className="font-bold text-accentBlue block">Day {rn.dayNum}</span>
                    <span className="text-textSecondary line-clamp-1">{rn.note}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <SaveDayButton onSave={handleSave} />
        </div>
      </div>
    </div>
  );
};
