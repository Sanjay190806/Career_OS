import React, { useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useCareerStore } from '../app/store/useCareerStore';
import { getTodayDay } from '../utils/dateUtils';

export const SkillRackPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const skillRackStats = careerState.skillRackStats || { totalSolved: 0, easyCount: 0, mediumCount: 0, hardCount: 0, categories: {} };
  const dailyLogs = careerState.dailyLogs || {};
  const userProfile = careerState.userProfile;
  const updateSkillRackStats = useCareerStore((s) => s.updateSkillRackStats);
  const updateSkillRackCategory = useCareerStore((s) => s.updateSkillRackCategory);

  const skillRackCategories = [
    'Basic I/O', 'If/Else', 'Loops', 'Arrays', 'Strings', 'Functions',
    'Recursion', 'Sorting', 'Searching', 'Pattern Printing', 'Math', 'Matrix', 'Hashing'
  ];

  const todayDay = getTodayDay(userProfile.startDate);

  const metrics = useMemo(() => {
    const dayNumbers = Array.from({ length: todayDay }, (_, index) => index + 1);
    const solvedByDay = dayNumbers.map((day) => dailyLogs[day]?.counts?.skillrack || 0);
    const weeklySolved = solvedByDay.slice(-7).reduce((sum, value) => sum + value, 0);
    const bestDay = Math.max(0, ...solvedByDay);
    let streak = 0;
    for (let day = todayDay; day >= 1; day -= 1) {
      if ((dailyLogs[day]?.counts?.skillrack || 0) > 0) streak += 1;
      else break;
    }
    return {
      weeklySolved,
      bestDay,
      streak,
      todaySolved: dailyLogs[todayDay]?.counts?.skillrack || 0
    };
  }, [dailyLogs, todayDay]);

  const handleDifficultyIncrement = (diff: 'easyCount' | 'mediumCount' | 'hardCount', val: number) => {
    const currentVal = skillRackStats[diff] || 0;
    const newVal = Math.max(0, currentVal + val);
    const total = (diff === 'easyCount' ? newVal : skillRackStats.easyCount) +
      (diff === 'mediumCount' ? newVal : skillRackStats.mediumCount) +
      (diff === 'hardCount' ? newVal : skillRackStats.hardCount);

    updateSkillRackStats({
      [diff]: newVal,
      totalSolved: total
    });
  };

  const handleCategoryIncrement = (cat: string, val: number) => {
    const cats = skillRackStats.categories || {};
    const currentVal = cats[cat] || 0;
    updateSkillRackCategory(cat, Math.max(0, currentVal + val));
  };

  const targetProgress = Math.min(Math.round((skillRackStats.totalSolved / 1200) * 100), 100);
  const dailyTargetProgress = Math.min(Math.round((metrics.todaySolved / 10) * 100), 100);

  return (
    <div className="fade-in flex flex-col gap-6 pb-10 select-none">
      <SectionHeader
        title="SkillRack Coding Board"
        subtitle="Clean daily counters, category progress, and pacing toward the 1200 target"
      />

      <Card className="grid gap-4 border-border-accent/20 bg-gradient-to-r from-accentBlue/10 via-bgCard to-bgCard p-4 md:grid-cols-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Total Solved</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">{skillRackStats.totalSolved}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Weekly Solved</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">{metrics.weeklySolved}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Best Day</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">{metrics.bestDay}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Current Streak</p>
          <p className="mt-1 text-2xl font-semibold text-textPrimary">{metrics.streak} days</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Quick Updates</p>
              <h3 className="mt-1 text-lg font-semibold text-textPrimary">Easy / Medium / Hard</h3>
            </div>
            <span className="text-xs text-textSecondary">Daily target: 10</span>
          </div>

          <div className="grid gap-3">
            {([
              ['Easy Problems', 'easyCount'],
              ['Medium Problems', 'mediumCount'],
              ['Hard Problems', 'hardCount']
            ] as const).map(([label, key]) => (
              <div key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white/[0.04] px-4 py-3">
                <span className="text-sm font-medium text-textPrimary">{label}</span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleDifficultyIncrement(key, -1)}>
                    -
                  </Button>
                  <span className={`min-w-10 text-center text-lg font-semibold text-textPrimary`}>
                    {skillRackStats[key]}
                  </span>
                  <Button type="button" size="sm" onClick={() => handleDifficultyIncrement(key, 1)}>
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Daily Target</p>
              <p className="mt-2 text-xl font-semibold text-textPrimary">{metrics.todaySolved}/10</p>
              <ProgressBar value={dailyTargetProgress} color="var(--accent-blue)" className="mt-3" />
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">1200 Target</p>
              <p className="mt-2 text-xl font-semibold text-textPrimary">{skillRackStats.totalSolved}/1200</p>
              <ProgressBar value={targetProgress} color="var(--accent-orange)" className="mt-3" />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Category Progress</p>
            <h3 className="mt-1 text-lg font-semibold text-textPrimary">SkillRack topic spread</h3>
          </div>
          <div className="flex flex-col gap-3">
            {skillRackCategories.map((cat) => {
              const count = (skillRackStats.categories || {})[cat] || 0;
              const pct = Math.min(Math.round((count / 25) * 100), 100);
              return (
                <div key={cat} className="rounded-2xl border border-border-subtle bg-white/[0.04] p-3">
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-textPrimary">{cat}</span>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleCategoryIncrement(cat, -1)}>
                        -
                      </Button>
                      <span className="w-6 text-center font-semibold text-textPrimary">{count}</span>
                      <Button type="button" size="sm" onClick={() => handleCategoryIncrement(cat, 1)}>
                        +
                      </Button>
                    </div>
                  </div>
                  <ProgressBar value={pct} color="var(--accent-emerald)" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
