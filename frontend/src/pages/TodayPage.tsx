import React, { useState } from 'react';
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
import { ROADMAP } from '../data/roadmap';
import { CS_SUBJECTS } from '../data/csSubjects';
import { DailyLog, ProblemLog, ActivityCounts } from '../types';
import { awardXPForLog, getLevel } from '../utils/xpUtils';
import { BookOpen, HelpCircle } from 'lucide-react';

const DEFAULT_COUNTS: ActivityCounts = {
  leetcode: 0,
  skillrack: 0,
  aptitude: 0,
  sql: 0,
  cscore: 0,
  german: 0,
  ml: 0,
  project: 0,
  resume: 0
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
  xpEarned: 0
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

export const TodayPage: React.FC = () => {
  const selectedDay = useDailyLogStore((s) => s.selectedDay);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const problemLogs = useCareerStore((s) => s.problemLogs);
  const csCoreProgress = useCareerStore((s) => s.csCoreProgress || {});
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);
  const updateProblemLog = useCareerStore((s) => s.updateProblemLog);
  const updateCSCoreTopic = useCareerStore((s) => s.updateCSCoreTopic);
  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  
  const xp = useCareerStore((s) => s.xp);
  const setCareerState = useCareerStore.setState;

  const currentLog = dailyLogs[selectedDay] || { ...DEFAULT_LOG, savedAt: new Date().toISOString() };
  const currentCounts = currentLog.counts || DEFAULT_COUNTS;
  const currentProblems = ROADMAP[String(selectedDay)] || [];

  // Local feedback toast state
  const [showToast, setShowToast] = useState(false);
  const [xpToastEarned, setXpToastEarned] = useState(0);

  // CS Core rotation calculation
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

  const handleSave = () => {
    // 1. Calculate XP Earned
    const calculatedXP = awardXPForLog(selectedDay, currentLog);
    
    // 2. Compute status automatically
    let newStatus = currentLog.status;
    const allLCSolved = currentLog.lcStatus?.length === currentProblems.length && currentProblems.length > 0;
    const hasAptitudeProgress = currentCounts.aptitude >= 15;
    
    if (allLCSolved && hasAptitudeProgress) {
      newStatus = 'completed';
    } else if (currentLog.lcStatus?.length > 0 || Object.values(currentCounts).some(v => v > 0)) {
      newStatus = 'partial';
    }

    // 3. Update day log status
    updateDailyLog(selectedDay, {
      status: newStatus,
      xpEarned: calculatedXP,
      savedAt: new Date().toISOString()
    });

    // 4. Update cumulative XP
    const newCumulativeXP = xp + calculatedXP;
    const newLevelObj = getLevel(newCumulativeXP);

    setCareerState({
      xp: newCumulativeXP,
      level: newLevelObj.level
    });

    // 5. Trigger success toast
    setXpToastEarned(calculatedXP);
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

  const handleCSCoreToggle = () => {
    const nextCompleted = !topicProgress.completed;
    updateCSCoreTopic(csTarget.subjectId, csTarget.topicName, {
      completed: nextCompleted,
      lastRevisedAt: nextCompleted ? new Date().toISOString() : null
    });
    
    // Auto increment cscore counter in daily log
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
          <span>✓</span> Day logs saved successfully! Earned +{xpToastEarned} XP
        </div>
      )}

      {/* Week Calendar strip */}
      <WeekStrip />

      {/* Title & topic header */}
      <TodayHeader />

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
                placeholder="Key terms, equations, normalizations, complexities, or triggers..."
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
                  onClick={() => askShayla(`Explain the CS Core topic "${csTarget.topicName}" for my placement prep. Focus on subject "${csTarget.subjectName}". Question: ${csTarget.sampleQuestion}. Provide common interview questions and Java context if relevant.`)}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              unit="questions"
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
              label="German Study"
              emoji="🇩🇪"
              value={currentCounts.german || 0}
              target={20}
              unit="minutes"
              color="#10B981"
              onIncrement={() => updateCount('german', 'inc')}
              onDecrement={() => updateCount('german', 'dec')}
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
        </div>

        {/* Right Sidebar panels */}
        <div className="flex flex-col gap-6">
          <Card className="border-accentPurple/20 bg-accentPurple/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accentPurple">Shayla Mission Coach</p>
            <h3 className="mt-1 text-base font-semibold text-textPrimary">Today rescue panel</h3>
            <div className="mt-3 grid gap-2">
              <Button size="sm" variant="ghost" onClick={() => askShayla(`Explain today's DSA pattern for Day ${selectedDay}. Use Java only. Problems: ${currentProblems.map((p) => p.title).join(', ') || 'No scheduled problems'}.`)}>
                Explain today's DSA pattern
              </Button>
              <Button size="sm" variant="ghost" onClick={() => askShayla(`Give me a hint only for today's first DSA problem in Java. Do not give the full solution. Problem: ${currentProblems[0]?.title || 'revision day'}.`)}>
                Give hint only
              </Button>
              <Button size="sm" variant="ghost" onClick={() => askShayla(`Create a recovery plan for Day ${selectedDay}. Mood ${currentLog.mood}, energy ${currentLog.energy}, distractions ${currentLog.distractions}.`)}>
                Create recovery plan
              </Button>
              <Button size="sm" variant="ghost" onClick={() => askShayla('Motivate me to finish today. Be honest, calm, and give one tiny next action.')}>
                Motivate me to finish today
              </Button>
              <Button size="sm" variant="ghost" onClick={() => askShayla('Teach German phrase for today with English meaning, pronunciation, and one practice sentence.')}>
                Teach German Phrase
              </Button>
            </div>
          </Card>

          {/* Focus timer and mood panel */}
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
          <SaveDayButton onSave={handleSave} />
        </div>
      </div>
    </div>
  );
};
