import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArchiveRestore,
  BarChart3,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  Download,
  Dumbbell,
  FileJson,
  Flame,
  Gauge,
  GraduationCap,
  History,
  Languages,
  Lock,
  Medal,
  NotebookPen,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  Zap,
} from 'lucide-react';
import { usePlacementDisciplineStore } from '../app/store/usePlacementDisciplineStore';
import { useUIStore } from '../app/store/useUIStore';
import {
  APTITUDE_TOPICS,
  COMPANIES,
  COMPANY_PREP_CATEGORIES,
  CORE_SUBJECTS,
  JOURNEY_TOTAL_DAYS,
  calculateCompanyReadiness,
  calculateLightningScore,
  calculateMonthlyLeetCodeProgress,
  calculateXP,
  canEditDate,
  createEmptyEntry,
  generateTomorrowPlan,
  getAccessMode,
  getGrade,
  getWeeklyReview,
  summarizeProgress,
  toISODate,
  type PlacementEntry,
} from '../utils/placementDisciplineEngine.mjs';
import { exportRawRecoveryData } from '../utils/progressRecovery.mjs';

type TabId =
  | 'overview'
  | 'today'
  | 'history'
  | 'java'
  | 'skillrack'
  | 'leetcode'
  | 'sql'
  | 'aptitude'
  | 'core'
  | 'german'
  | 'profile'
  | 'company'
  | 'interview'
  | 'mistakes'
  | 'weekly'
  | 'settings';

const tabLabels: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'today', label: 'Today' },
  { id: 'history', label: 'History' },
  { id: 'java', label: 'Java / DSA' },
  { id: 'skillrack', label: 'SkillRack' },
  { id: 'leetcode', label: 'LeetCode' },
  { id: 'sql', label: 'SQL' },
  { id: 'aptitude', label: 'Aptitude' },
  { id: 'core', label: 'Core CS' },
  { id: 'german', label: 'German' },
  { id: 'profile', label: 'Resume / GitHub / LinkedIn' },
  { id: 'company', label: 'Company Prep' },
  { id: 'interview', label: 'Interview Questions' },
  { id: 'mistakes', label: 'Mistake Notes' },
  { id: 'weekly', label: 'Weekly Review' },
  { id: 'settings', label: 'Settings / Backup' },
];

const sectionToTab: Record<string, TabId> = {
  overview: 'overview',
  today: 'today',
  placement_os: 'overview',
  dsa_tracker: 'java',
  leetcode: 'leetcode',
  skillrack: 'skillrack',
  aptitude: 'aptitude',
  sql: 'sql',
  cscore: 'core',
  german: 'german',
  resume: 'profile',
  companies: 'company',
  interview_coach: 'interview',
  mistakes: 'mistakes',
  reports: 'weekly',
  history: 'history',
  settings: 'settings',
};

const todayKey = toISODate();
const firstJourneyDate = '2026-07-01';

const clamp = (value: number, min = 0, max = 999) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));

const getJourneyDay = (dateKey: string) => {
  const start = new Date(`${firstJourneyDate}T00:00:00`);
  const current = new Date(`${dateKey}T00:00:00`);
  const diff = Math.floor((current.getTime() - start.getTime()) / 86400000) + 1;
  return Math.max(1, Math.min(JOURNEY_TOTAL_DAYS, diff));
};

const NumberInput: React.FC<{
  label: string;
  value: number;
  disabled: boolean;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}> = ({ label, value, disabled, min = 0, max = 999, onChange }) => (
  <label className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
    {label}
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
      className="rounded-xl border border-border-subtle bg-bgSurface/60 px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:border-accentBlue disabled:cursor-not-allowed disabled:opacity-50"
    />
  </label>
);

const TextInput: React.FC<{
  label: string;
  value: string;
  disabled: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}> = ({ label, value, disabled, placeholder, onChange }) => (
  <label className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
    {label}
    <input
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border border-border-subtle bg-bgSurface/60 px-3 py-2.5 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-accentBlue disabled:cursor-not-allowed disabled:opacity-50"
    />
  </label>
);

const SelectInput: React.FC<{
  label: string;
  value: string;
  disabled: boolean;
  options: string[];
  onChange: (value: string) => void;
}> = ({ label, value, disabled, options, onChange }) => (
  <label className="flex flex-col gap-2 text-xs font-semibold text-textSecondary">
    {label}
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-xl border border-border-subtle bg-bgSurface/60 px-3 py-2.5 text-sm text-textPrimary outline-none transition focus:border-accentBlue disabled:cursor-not-allowed disabled:opacity-50"
    >
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>
);

const Toggle: React.FC<{
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, disabled, onChange }) => (
  <label className={`flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-white/[0.03] px-3 py-2.5 text-sm text-textPrimary ${disabled ? 'opacity-50' : ''}`}>
    <span>{label}</span>
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 accent-blue-500"
    />
  </label>
);

const MetricCard: React.FC<{ label: string; value: string | number; detail?: string; icon: React.ElementType }> = ({ label, value, detail, icon: Icon }) => (
  <div className="rounded-2xl border border-border-subtle bg-white/[0.035] p-4">
    <div className="mb-3 flex items-center justify-between gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-textMuted">{label}</span>
      <Icon className="h-4 w-4 text-accentBlue" />
    </div>
    <div className="text-2xl font-black text-textPrimary">{value}</div>
    {detail && <div className="mt-1 text-xs text-textSecondary">{detail}</div>}
  </div>
);

const ProgressBar: React.FC<{ value: number; tone?: 'blue' | 'green' | 'amber' | 'red' }> = ({ value, tone = 'blue' }) => {
  const colors = {
    blue: 'bg-accentBlue',
    green: 'bg-accentEmerald',
    amber: 'bg-amber-400',
    red: 'bg-rose-500',
  };
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div className={`h-full rounded-full ${colors[tone]}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
};

const Panel: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; detail?: string }> = ({ title, icon: Icon, children, detail }) => (
  <section className="rounded-2xl border border-border-subtle bg-bgSurface/70 p-5 shadow-soft">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-accentBlue" />
          <h2 className="text-base font-bold text-textPrimary">{title}</h2>
        </div>
        {detail && <p className="mt-1 text-xs text-textSecondary">{detail}</p>}
      </div>
    </div>
    {children}
  </section>
);

const Heatmap: React.FC<{
  days: ReturnType<typeof summarizeProgress>['days'];
  onSelect: (dateKey: string) => void;
}> = ({ days, onSelect }) => {
  const known = new Map(days.map((day) => [day.dateKey, day]));
  const start = new Date(`${firstJourneyDate}T00:00:00`);
  const cells = Array.from({ length: JOURNEY_TOTAL_DAYS }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = toISODate(date);
    const day = known.get(dateKey);
    const access = getAccessMode(dateKey, todayKey);
    const score = day?.lightningScore || 0;
    const color = access.blocked
      ? 'bg-white/[0.025] opacity-40'
      : day?.success
        ? score >= 75 ? 'bg-emerald-400' : 'bg-emerald-700'
        : day
          ? 'bg-rose-500/70'
          : access.status === 'today'
            ? 'bg-blue-500/80'
            : 'bg-white/10';
    return (
      <button
        key={dateKey}
        type="button"
        disabled={access.blocked}
        title={`${dateKey} ${day ? `${day.grade} ${score}` : access.status}`}
        onClick={() => onSelect(dateKey)}
        className={`h-3.5 w-3.5 rounded-[3px] border ${dateKey === todayKey ? 'border-white' : 'border-white/10'} ${color}`}
      />
    );
  });
  return <div className="grid grid-cols-[repeat(23,minmax(0,1fr))] gap-1">{cells}</div>;
};

export const PlacementDisciplinePage: React.FC = () => {
  const [tab, setTab] = useState<TabId>('overview');
  const [restoreMessage, setRestoreMessage] = useState('');
  const [advancedRecoveryOpen, setAdvancedRecoveryOpen] = useState(false);
  const [rawRecoveryPreview, setRawRecoveryPreview] = useState('');
  const [desktopMode, setDesktopMode] = useState(false);
  const [desktopStoragePath, setDesktopStoragePath] = useState('');
  const desktopHydratedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeSection = useUIStore((state) => state.activeSection);
  const entries = usePlacementDisciplineStore((state) => state.entries);
  const selectedDate = usePlacementDisciplineStore((state) => state.selectedDate);
  const lastBackupAt = usePlacementDisciplineStore((state) => state.lastBackupAt);
  const recoveryStatus = usePlacementDisciplineStore((state) => state.recoveryStatus);
  const recoveryInspection = usePlacementDisciplineStore((state) => state.lastRecoveryInspection);
  const setSelectedDate = usePlacementDisciplineStore((state) => state.setSelectedDate);
  const updateTodayEntry = usePlacementDisciplineStore((state) => state.updateTodayEntry);
  const exportBackup = usePlacementDisciplineStore((state) => state.exportBackup);
  const restoreBackup = usePlacementDisciplineStore((state) => state.restoreBackup);
  const inspectRecovery = usePlacementDisciplineStore((state) => state.inspectRecovery);
  const backupRecoveryData = usePlacementDisciplineStore((state) => state.backupRecoveryData);
  const recoverOldProgressAction = usePlacementDisciplineStore((state) => state.recoverOldProgress);
  const autoRecoverOldProgress = usePlacementDisciplineStore((state) => state.autoRecoverOldProgress);
  const importDesktopProgress = usePlacementDisciplineStore((state) => state.importDesktopProgress);
  const saveDesktopProgress = usePlacementDisciplineStore((state) => state.saveDesktopProgress);

  useEffect(() => {
    const nextTab = sectionToTab[activeSection];
    if (nextTab) setTab(nextTab);
  }, [activeSection]);

  useEffect(() => {
    const result = autoRecoverOldProgress();
    if (result.ok) setRestoreMessage(result.message);
  }, [autoRecoverOldProgress]);

  useEffect(() => {
    if (!window.sanzzOS || desktopHydratedRef.current) return;
    desktopHydratedRef.current = true;
    setDesktopMode(true);
    window.sanzzOS.loadProgress()
      .then((result) => {
        setDesktopStoragePath(result.storagePath);
        const desktopEntries = result.data?.entries || {};
        const localEntries = usePlacementDisciplineStore.getState().entries;
        if (Object.keys(desktopEntries).length > 0) {
          importDesktopProgress({
            entries: desktopEntries,
            selectedDate: result.data.selectedDate,
            lastBackupAt: result.data.lastBackupAt,
          });
          if (result.warning) setRestoreMessage(`Desktop storage warning: ${result.warning}`);
          return;
        }
        if (Object.keys(localEntries).length > 0) {
          window.sanzzOS?.saveProgress({
            entries: localEntries,
            selectedDate: usePlacementDisciplineStore.getState().selectedDate,
            lastBackupAt: usePlacementDisciplineStore.getState().lastBackupAt,
            metadata: {
              migratedFromLocalStorage: true,
              migratedAt: new Date().toISOString(),
              sourceKey: 'sanzz-placement-discipline-v18',
            },
          }).then((saveResult) => {
            if (saveResult.ok) setRestoreMessage('Local v1.8 progress copied into desktop file storage.');
          });
        }
      })
      .catch(() => {
        setRestoreMessage('Desktop storage could not be loaded. Browser storage remains active.');
      });
  }, [importDesktopProgress]);

  useEffect(() => {
    if (!desktopMode || !desktopHydratedRef.current || Object.keys(entries).length === 0) return;
    const timer = window.setTimeout(() => {
      saveDesktopProgress().catch(() => undefined);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [desktopMode, entries, saveDesktopProgress]);

  const activeEntry = entries[selectedDate] || createEmptyEntry();
  const todayEntry = entries[todayKey] || createEmptyEntry();
  const access = getAccessMode(selectedDate, todayKey);
  const todayCanEdit = canEditDate(selectedDate, todayKey);
  const monthProgress = calculateMonthlyLeetCodeProgress(entries, todayKey.slice(0, 7));
  const lightningScore = calculateLightningScore(activeEntry, monthProgress);
  const grade = getGrade(lightningScore);
  const summary = useMemo(() => summarizeProgress(entries, todayKey), [entries]);
  const tomorrowPlan = useMemo(() => generateTomorrowPlan(todayEntry, entries, todayKey), [entries, todayEntry]);
  const weeklyReview = useMemo(() => getWeeklyReview(entries, todayKey), [entries]);
  const companyReadiness = useMemo(() => COMPANIES.map((company) => calculateCompanyReadiness(entries, company)), [entries]);

  const update = (patch: Partial<PlacementEntry>) => {
    if (!todayCanEdit) return;
    updateTodayEntry(todayKey, patch);
  };

  const handleSelectDate = (dateKey: string) => {
    setSelectedDate(dateKey);
    setTab(dateKey === todayKey ? 'today' : 'history');
  };

  const handleExport = () => {
    const backup = exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sanzz-career-os-v18-backup-${todayKey}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDesktopBackup = async () => {
    if (!window.sanzzOS) return;
    const result = await window.sanzzOS.exportBackup();
    setRestoreMessage(result.ok ? `Desktop backup created: ${result.backupFile}` : 'Desktop backup failed.');
  };

  const handleOpenBackupFolder = async () => {
    if (!window.sanzzOS) return;
    await window.sanzzOS.openBackupFolder();
  };

  const handleRestore = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const confirmed = window.confirm('Restore this v1.8 placement backup? Current v1.8 entries will be replaced.');
      if (!confirmed) return;
      const result = restoreBackup(payload);
      setRestoreMessage(result.message);
    } catch {
      setRestoreMessage('Could not read backup JSON.');
    } finally {
      event.target.value = '';
    }
  };

  const handleRawRecoveryExport = () => {
    inspectRecovery();
    const payload = exportRawRecoveryData();
    const serialized = JSON.stringify(payload, null, 2);
    setRawRecoveryPreview(serialized);
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `sanzz-career-os-recovery-inspection-${todayKey}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const readinessAverage = companyReadiness.length
    ? Math.round(companyReadiness.reduce((sum, company) => sum + company.readiness, 0) / companyReadiness.length)
    : 0;
  const weakArea = weeklyReview.weakestArea;
  const missionSummary = [
    `${todayEntry.skillrackCount}/10 SkillRack`,
    `${monthProgress.solved}/50 LeetCode`,
    `${todayEntry.aptitudeCount} aptitude`,
    todayEntry.coreConceptDone ? 'Core CS done' : 'Core CS pending',
    `${todayEntry.germanMinutes}/15 German`,
  ].join(' | ');

  const renderTodayForm = () => (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="grid gap-5">
        <Panel title="Today Mission" icon={Target} detail={access.readOnly ? 'Past days are read-only.' : access.blocked ? 'Future days are blocked.' : 'Only today can be edited.'}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <NumberInput label="SkillRack problems" value={activeEntry.skillrackCount} disabled={!todayCanEdit} max={100} onChange={(value) => update({ skillrackCount: value })} />
            <NumberInput label="LeetCode easy" value={activeEntry.leetcodeEasy} disabled={!todayCanEdit} max={50} onChange={(value) => update({ leetcodeEasy: value })} />
            <NumberInput label="LeetCode medium" value={activeEntry.leetcodeMedium} disabled={!todayCanEdit} max={50} onChange={(value) => update({ leetcodeMedium: value })} />
            <NumberInput label="LeetCode hard" value={activeEntry.leetcodeHard} disabled={!todayCanEdit} max={50} onChange={(value) => update({ leetcodeHard: value })} />
            <NumberInput label="Aptitude questions" value={activeEntry.aptitudeCount} disabled={!todayCanEdit} max={200} onChange={(value) => update({ aptitudeCount: value })} />
            <SelectInput label="Aptitude topic" value={activeEntry.aptitudeTopic} disabled={!todayCanEdit} options={APTITUDE_TOPICS} onChange={(value) => update({ aptitudeTopic: value })} />
          </div>
        </Panel>

        <Panel title="Core CS, SQL, German" icon={BookOpen}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Toggle label="SQL done" checked={activeEntry.sqlDone} disabled={!todayCanEdit} onChange={(value) => update({ sqlDone: value })} />
            <TextInput label="SQL notes" value={activeEntry.sqlNotes} disabled={!todayCanEdit} placeholder="joins, group by, subqueries..." onChange={(value) => update({ sqlNotes: value })} />
            <SelectInput label="Core subject" value={activeEntry.coreSubject} disabled={!todayCanEdit} options={CORE_SUBJECTS} onChange={(value) => update({ coreSubject: value })} />
            <TextInput label="Core concept" value={activeEntry.coreConcept} disabled={!todayCanEdit} placeholder="polymorphism, indexing, deadlock..." onChange={(value) => update({ coreConcept: value })} />
            <Toggle label="Core concept done" checked={activeEntry.coreConceptDone} disabled={!todayCanEdit} onChange={(value) => update({ coreConceptDone: value })} />
            <NumberInput label="German minutes" value={activeEntry.germanMinutes} disabled={!todayCanEdit} max={240} onChange={(value) => update({ germanMinutes: value })} />
          </div>
        </Panel>

        <Panel title="Placement Profile and Company Prep" icon={BriefcaseBusiness}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Toggle label="Resume updated" checked={activeEntry.resumeUpdated} disabled={!todayCanEdit} onChange={(value) => update({ resumeUpdated: value })} />
            <Toggle label="GitHub updated" checked={activeEntry.githubUpdated} disabled={!todayCanEdit} onChange={(value) => update({ githubUpdated: value })} />
            <Toggle label="LinkedIn updated" checked={activeEntry.linkedinUpdated} disabled={!todayCanEdit} onChange={(value) => update({ linkedinUpdated: value })} />
            <Toggle label="Company prep done" checked={activeEntry.companyPrepDone} disabled={!todayCanEdit} onChange={(value) => update({ companyPrepDone: value })} />
            <SelectInput label="Company" value={activeEntry.companyName} disabled={!todayCanEdit} options={COMPANIES} onChange={(value) => update({ companyName: value })} />
            <TextInput label="Company prep notes" value={activeEntry.companyPrepNotes} disabled={!todayCanEdit} placeholder="Zoho aptitude, SQL, HR..." onChange={(value) => update({ companyPrepNotes: value })} />
          </div>
        </Panel>

        <Panel title="Interview Prep and Reflection" icon={NotebookPen}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Toggle label="Mock interview done" checked={activeEntry.mockInterviewDone} disabled={!todayCanEdit} onChange={(value) => update({ mockInterviewDone: value })} />
            <Toggle label="Interview question reviewed" checked={activeEntry.interviewQuestionReviewed} disabled={!todayCanEdit} onChange={(value) => update({ interviewQuestionReviewed: value })} />
            <Toggle label="Mistake note added" checked={activeEntry.mistakeNoteAdded} disabled={!todayCanEdit} onChange={(value) => update({ mistakeNoteAdded: value })} />
            <TextInput label="Mistake notes" value={activeEntry.mistakeNotes} disabled={!todayCanEdit} placeholder="What failed, how to prevent repeat..." onChange={(value) => update({ mistakeNotes: value })} />
            <NumberInput label="Energy level" value={activeEntry.energyLevel} disabled={!todayCanEdit} min={1} max={10} onChange={(value) => update({ energyLevel: value })} />
            <NumberInput label="Sleep hours" value={activeEntry.sleepHours} disabled={!todayCanEdit} min={0} max={16} onChange={(value) => update({ sleepHours: value })} />
            <TextInput label="Mood" value={activeEntry.mood} disabled={!todayCanEdit} onChange={(value) => update({ mood: value })} />
            <TextInput label="Biggest distraction" value={activeEntry.biggestDistraction} disabled={!todayCanEdit} onChange={(value) => update({ biggestDistraction: value })} />
            <TextInput label="Tomorrow first task" value={activeEntry.tomorrowFirstTask} disabled={!todayCanEdit} placeholder="First task after opening laptop" onChange={(value) => update({ tomorrowFirstTask: value })} />
          </div>
        </Panel>
      </div>

      <div className="grid content-start gap-5">
        <Panel title="Lightning Score" icon={Zap}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-5xl font-black text-textPrimary">{lightningScore}</div>
              <div className="text-xs text-textSecondary">Grade {grade} | {calculateXP(activeEntry)} XP today</div>
            </div>
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-accentBlue/30 bg-accentBlue/10 text-3xl font-black text-accentBlue">
              {grade}
            </div>
          </div>
          <div className="mt-4"><ProgressBar value={lightningScore} tone={lightningScore >= 75 ? 'green' : lightningScore >= 40 ? 'amber' : 'red'} /></div>
        </Panel>

        <Panel title="Tomorrow Auto Plan" icon={Rocket}>
          <div className="grid gap-2">
            {tomorrowPlan.map((item) => (
              <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-textSecondary">{item}</div>
            ))}
          </div>
        </Panel>

        <Panel title="Honesty Guard" icon={Lock}>
          <div className="grid gap-2 text-sm text-textSecondary">
            <div>Selected date: <span className="text-textPrimary">{selectedDate}</span></div>
            <div>Status: <span className="text-textPrimary">{access.status}</span></div>
            <div>{access.canEdit ? 'This day can be edited.' : access.readOnly ? 'This day is read-only.' : 'This day is blocked until it arrives.'}</div>
          </div>
        </Panel>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="grid gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Current Streak" value={summary.currentStreak} detail="Successful basics chain" icon={Flame} />
        <MetricCard label="Longest Streak" value={summary.longestStreak} detail={summary.comebackBadge ? 'Comeback badge active' : 'No rest-day exceptions'} icon={Medal} />
        <MetricCard label="XP / Level" value={`${summary.totalXP} XP`} detail={`Level ${summary.level.level}: ${summary.level.title}`} icon={Sparkles} />
        <MetricCard label="Monthly LeetCode" value={`${monthProgress.solved} / 50`} detail={`${monthProgress.percentage}% of monthly target`} icon={Code2} />
        <MetricCard label="Active Days" value={summary.activeDays} detail={`${summary.missedDays} missed days recorded`} icon={CalendarDays} />
        <MetricCard label="Placement Readiness" value={`${readinessAverage}%`} detail="Company readiness average" icon={ShieldCheck} />
        <MetricCard label="Weak Area Alert" value={weakArea} detail="From weekly review" icon={AlertTriangle} />
        <MetricCard label="German Streak" value={summary.days.filter((day) => day.entry.germanMinutes >= 15).length} detail="Days with 15+ minutes" icon={Languages} />
      </div>
      <Panel title="Contribution Heatmap" icon={BarChart3} detail="Successful days are green. Missed logged days are red. Future days are disabled.">
        <Heatmap days={summary.days} onSelect={handleSelectDate} />
      </Panel>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Today Mission" icon={Target}><p className="text-sm text-textSecondary">{missionSummary}</p></Panel>
        <Panel title="Tomorrow Plan" icon={Rocket}><p className="text-sm text-textSecondary">{tomorrowPlan[0]}</p></Panel>
        <Panel title="SkillRack Consistency" icon={Dumbbell}><ProgressBar value={Math.min(100, (todayEntry.skillrackCount / 10) * 100)} tone="green" /></Panel>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="grid gap-5">
      <Panel title="Read-Only History" icon={History} detail="Click a past day in the heatmap or choose a saved entry. Future dates cannot be opened for edits.">
        <div className="mb-4"><Heatmap days={summary.days} onSelect={handleSelectDate} /></div>
        <div className="grid max-h-[420px] gap-2 overflow-y-auto">
          {summary.days.length === 0 && <p className="text-sm text-textSecondary">No saved v1.8 placement entries yet.</p>}
          {[...summary.days].reverse().map((day) => (
            <button key={day.dateKey} type="button" onClick={() => handleSelectDate(day.dateKey)} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-white/[0.03] p-3 text-left">
              <span className="text-sm font-semibold text-textPrimary">{day.dateKey}</span>
              <span className="text-xs text-textSecondary">{day.xp} XP | Lightning {day.lightningScore} | Grade {day.grade} | {day.success ? 'Successful' : 'Missed basics'}</span>
            </button>
          ))}
        </div>
      </Panel>
      {renderTodayForm()}
    </div>
  );

  const renderCompany = () => (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {companyReadiness.map((company) => (
        <Panel key={company.companyName} title={company.companyName} icon={BriefcaseBusiness} detail={`${company.readiness}% readiness`}>
          <div className="grid gap-3">
            <ProgressBar value={company.readiness} tone={company.readiness >= 70 ? 'green' : 'amber'} />
            <div className="grid grid-cols-2 gap-2 text-xs text-textSecondary">
              <span>Coding {company.codingReadiness}%</span>
              <span>Aptitude {company.aptitudeReadiness}%</span>
              <span>CS {company.csReadiness}%</span>
              <span>SQL {company.sqlReadiness}%</span>
              <span>Communication {company.communicationReadiness}%</span>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-textMuted">Pending tasks</h3>
              <div className="flex flex-wrap gap-2">
                {company.pendingTasks.slice(0, 8).map((task) => <span key={task} className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-textSecondary">{task}</span>)}
              </div>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );

  const renderWeekly = () => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total XP This Week" value={weeklyReview.xp} icon={Zap} />
      <MetricCard label="Successful Days" value={weeklyReview.successfulDays} icon={CheckCircle2} />
      <MetricCard label="Missed Days" value={weeklyReview.missedDays} icon={AlertTriangle} />
      <MetricCard label="SkillRack Total" value={weeklyReview.skillrack} icon={Dumbbell} />
      <MetricCard label="LeetCode Total" value={weeklyReview.leetcode} icon={Code2} />
      <MetricCard label="Aptitude Total" value={weeklyReview.aptitude} icon={Brain} />
      <MetricCard label="Core Concepts" value={weeklyReview.core} icon={BookOpen} />
      <MetricCard label="German Days" value={weeklyReview.germanDays} icon={Languages} />
      <Panel title="Next Week Priority" icon={Rocket}><p className="text-sm text-textSecondary">{weeklyReview.nextWeekPriority}</p></Panel>
      <Panel title="Best Area" icon={Medal}><p className="text-sm text-textSecondary">{weeklyReview.bestArea}</p></Panel>
      <Panel title="Weakest Area" icon={AlertTriangle}><p className="text-sm text-textSecondary">{weeklyReview.weakestArea}</p></Panel>
      <Panel title="Profile Updates" icon={BriefcaseBusiness}><p className="text-sm text-textSecondary">{weeklyReview.profileUpdates} resume/GitHub/LinkedIn actions</p></Panel>
    </div>
  );

  const renderSettings = () => (
    <div className="grid gap-5">
      <Panel title="Backup and Restore" icon={FileJson} detail="Backups are local JSON files. Corrupted or non-v1.8 files are rejected before import.">
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl bg-accentBlue px-4 py-2 text-sm font-bold text-white"><Download className="h-4 w-4" />Export JSON</button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white/[0.03] px-4 py-2 text-sm font-bold text-textPrimary"><Upload className="h-4 w-4" />Restore JSON</button>
          {desktopMode && <button type="button" onClick={handleDesktopBackup} className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white/[0.03] px-4 py-2 text-sm font-bold text-textPrimary"><Download className="h-4 w-4" />Desktop Backup</button>}
          {desktopMode && <button type="button" onClick={handleOpenBackupFolder} className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white/[0.03] px-4 py-2 text-sm font-bold text-textPrimary"><ArchiveRestore className="h-4 w-4" />Open Backup Folder</button>}
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleRestore} className="hidden" />
        </div>
        <div className="mt-4 grid gap-2 text-sm text-textSecondary">
          <div>Last backup: <span className="text-textPrimary">{lastBackupAt || 'Not exported yet'}</span></div>
          {restoreMessage && <div>{restoreMessage}</div>}
        </div>
      </Panel>

      <Panel title="Progress Recovery" icon={ArchiveRestore} detail="Temporary safe recovery tools for v1.8.0 Today progress. Old keys are never deleted.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Old Data Found" value={recoveryInspection?.oldDataFound ? 'Yes' : 'No'} detail={`${recoveryInspection?.oldEntriesCount || 0} old entries`} icon={History} />
          <MetricCard label="New Data Found" value={recoveryInspection?.newDataFound ? 'Yes' : 'No'} detail={`${recoveryInspection?.newEntriesCount || 0} v1.8 entries`} icon={FileJson} />
          <MetricCard label="Today Detected" value={recoveryInspection?.todayDate || todayKey} detail="Asia/Kolkata date" icon={CalendarDays} />
          <MetricCard label="Latest Saved Date" value={recoveryInspection?.latestSavedDate || 'None'} detail={recoveryStatus || 'No migration run yet'} icon={Clock3} />
        </div>

        <div className="mt-4 grid gap-3 text-sm text-textSecondary">
          <div>
            <span className="font-semibold text-textPrimary">Detected localStorage keys:</span>{' '}
            {(recoveryInspection?.detectedLocalStorageKeys || []).filter((key) => key.toLowerCase().includes('career') || key.toLowerCase().includes('placement') || key.toLowerCase().includes('sanju')).slice(0, 12).join(', ') || 'Not inspected yet'}
          </div>
          <div>
            <span className="font-semibold text-textPrimary">Detected sessionStorage keys:</span>{' '}
            {(recoveryInspection?.detectedSessionStorageKeys || []).join(', ') || 'None'}
          </div>
          <div>
            <span className="font-semibold text-textPrimary">Migration status:</span> {recoveryInspection?.metadata?.status ? String(recoveryInspection.metadata.status) : recoveryStatus || 'Pending inspection'}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => inspectRecovery()} className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white/[0.03] px-4 py-2 text-sm font-bold text-textPrimary"><Search className="h-4 w-4" />Inspect Storage</button>
          <button type="button" onClick={() => setRestoreMessage(backupRecoveryData().message)} className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white/[0.03] px-4 py-2 text-sm font-bold text-textPrimary"><Download className="h-4 w-4" />Backup Current Data</button>
          <button type="button" onClick={() => setRestoreMessage(recoverOldProgressAction().message)} className="inline-flex items-center gap-2 rounded-xl bg-accentBlue px-4 py-2 text-sm font-bold text-white"><ArchiveRestore className="h-4 w-4" />Recover Old Progress</button>
          <button type="button" onClick={handleRawRecoveryExport} className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-white/[0.03] px-4 py-2 text-sm font-bold text-textPrimary"><Upload className="h-4 w-4" />Export Raw Recovery Data</button>
        </div>

        <button type="button" onClick={() => setAdvancedRecoveryOpen((value) => !value)} className="mt-4 text-xs font-bold uppercase tracking-widest text-accentBlue">
          {advancedRecoveryOpen ? 'Hide advanced raw inspection' : 'Show advanced raw inspection'}
        </button>
        {advancedRecoveryOpen && (
          <pre className="mt-3 max-h-80 overflow-auto rounded-xl border border-border-subtle bg-black/30 p-3 text-xs text-textSecondary">
            {rawRecoveryPreview || JSON.stringify(recoveryInspection, null, 2)}
          </pre>
        )}
      </Panel>
    </div>
  );

  const renderFocusedTab = () => {
    if (tab === 'history') return renderHistory();
    if (tab === 'company') return renderCompany();
    if (tab === 'weekly') return renderWeekly();
    if (tab === 'settings') return renderSettings();
    if (tab === 'overview') return renderOverview();
    return renderTodayForm();
  };

  const enterOS = () => setTab('overview');

  return (
    <div className="workspace-page pb-12">
      <section className="mb-6 overflow-hidden rounded-2xl border border-border-subtle bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_28%),linear-gradient(135deg,rgba(4,8,22,0.98),rgba(12,18,35,0.92))] p-6 shadow-soft md:p-8">
        {desktopMode && (
          <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100">
            Local Desktop Mode active. Progress is mirrored to desktop file storage{desktopStoragePath ? `: ${desktopStoragePath}` : '.'}
          </div>
        )}
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">
              <Flame className="h-3.5 w-3.5" /> v1.8 Placement Discipline Engine
            </div>
            <h1 className="text-4xl font-black tracking-normal text-textPrimary md:text-6xl">BEAST MODE</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-textSecondary md:text-base">
              Rebuild the routine into placement-ready discipline. Honest days only, local data only, no fake backfilling.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={enterOS} className="inline-flex items-center gap-2 rounded-xl bg-accentBlue px-5 py-3 text-sm font-black text-white shadow-glow-blue">
                <Rocket className="h-4 w-4" /> Enter Sanzz Career OS
              </button>
              <button type="button" onClick={() => setTab('today')} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-textPrimary">
                <Gauge className="h-4 w-4" /> Open Today
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Day" value={`${getJourneyDay(todayKey)} / ${JOURNEY_TOTAL_DAYS}`} icon={CalendarDays} />
            <MetricCard label="Current Streak" value={summary.currentStreak} icon={Flame} />
            <MetricCard label="Longest Streak" value={summary.longestStreak} icon={Medal} />
            <MetricCard label="LeetCode Month" value={`${monthProgress.solved} / 50`} icon={Code2} />
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-textSecondary">
          Today mission: {missionSummary}
        </div>
      </section>

      <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-border-subtle bg-bgSurface/60 p-2">
        {tabLabels.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${tab === item.id ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/[0.05] hover:text-textPrimary'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {access.blocked && (
        <div className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-100">
          Future day selected. It is visible for planning context, but editing is blocked until {selectedDate}.
        </div>
      )}

      {tab === 'java' && (
        <Panel title="Java / DSA" icon={GraduationCap} detail="Use SkillRack, LeetCode, company prep, and interview logs to build coding discipline.">
          <div className="grid gap-3 text-sm text-textSecondary">
            <div>LeetCode solved this month: {monthProgress.solved} / 50</div>
            <div>SkillRack today: {todayEntry.skillrackCount} / 10</div>
            <div>Default company categories: {COMPANY_PREP_CATEGORIES.join(', ')}</div>
          </div>
        </Panel>
      )}

      {tab !== 'java' && renderFocusedTab()}
    </div>
  );
};

export default PlacementDisciplinePage;
