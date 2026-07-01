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
import { BookOpen, HelpCircle, Zap, Activity } from 'lucide-react';
import { MobileQuickCheckIn } from '../components/mobile/MobileQuickCheckIn';
import { MobileShaylaDock } from '../components/mobile/MobileShaylaDock';
import { MiniStreakStrip } from '../components/ui/MiniStreakStrip';
import { TodayCommandCenter } from '../components/today/TodayCommandCenter';

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
  const queuePrompt = useAIStore((s) => s.queuePrompt);
  const setActiveSection = useUIStore((s) => s.setActiveSection);

  const currentLog = dailyLogs[selectedDay] || { ...DEFAULT_LOG, savedAt: new Date().toISOString() };
  const currentCounts = currentLog.counts || DEFAULT_COUNTS;
  const currentProblems = ROADMAP[String(selectedDay)] || [];

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

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 relative">
      <WeekStrip />
      <TodayHeader />
      <MiniStreakStrip />
      <MobileQuickCheckIn />
      <MobileShaylaDock />

      {/* Tabs navigation panel */}
      <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 text-xs font-black uppercase tracking-wider self-start select-none">
        <button
          onClick={() => setActiveTab('command')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'command' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Command Center</span>
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'activities' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Activity Loggers</span>
        </button>
      </div>

      {activeTab === 'command' ? (
        <TodayCommandCenter />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
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
            <FocusTimer onSessionComplete={(minutes) => updateDailyLog(selectedDay, { focusMinutes: (currentLog.focusMinutes || 0) + minutes })} />
            
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

            <SaveDayButton onSave={() => triggerConfetti()} />
          </div>
        </div>
      )}
    </div>
  );
};
export default TodayPage;
