import React from 'react';
import { AnalyticsOverviewCards } from '../components/analytics/AnalyticsOverviewCards';
import { AnalyticsInsightPanel } from '../components/analytics/AnalyticsInsightPanel';
import { BurnoutRiskCard } from '../components/analytics/BurnoutRiskCard';
import { CompletionRateChart } from '../components/analytics/CompletionRateChart';
import { FocusBalanceCard } from '../components/analytics/FocusBalanceCard';
import { LearningHeatmap } from '../components/analytics/LearningHeatmap';
import { MonthlyProgressChart } from '../components/analytics/MonthlyProgressChart';
import { ReadinessTrendChart } from '../components/analytics/ReadinessTrendChart';
import { SkillBreakdownChart } from '../components/analytics/SkillBreakdownChart';
import { TimeRangeSelector } from '../components/analytics/TimeRangeSelector';
import { WeeklyProgressChart } from '../components/analytics/WeeklyProgressChart';
import { XPTrendChart } from '../components/analytics/XPTrendChart';
import { useAnalytics } from '../hooks/useAnalytics';

export const AnalyticsPage: React.FC = () => {
  const { dashboard, range, setRange } = useAnalytics();

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-textPrimary">Analytics 2.0</h1>
          <p className="mt-2 max-w-3xl text-sm text-textSecondary">Learning, placement, XP, completion, revision, burnout, and focus balance analytics in one command view.</p>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>
      <AnalyticsOverviewCards snapshot={dashboard.snapshot} />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SkillBreakdownChart skills={dashboard.skills} />
        <AnalyticsInsightPanel insights={dashboard.insights} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <WeeklyProgressChart data={dashboard.weekly} />
        <MonthlyProgressChart data={dashboard.monthly} />
        <BurnoutRiskCard snapshot={dashboard.snapshot} />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <LearningHeatmap data={dashboard.productivityTrend} />
        <XPTrendChart data={dashboard.productivityTrend} />
        <ReadinessTrendChart data={dashboard.readinessTrend} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <CompletionRateChart data={dashboard.productivityTrend} />
        <FocusBalanceCard categories={dashboard.categories} />
      </div>
    </div>
  );
};
