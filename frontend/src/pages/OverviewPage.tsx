import React from 'react';
import { OverviewHero } from '../components/overview/OverviewHero';
import { OverviewMetrics } from '../components/overview/OverviewMetrics';
import { WeeklyTrend } from '../components/overview/WeeklyTrend';
import { JourneyHeatmap } from '../components/overview/JourneyHeatmap';
import { ReadinessPanel } from '../components/overview/ReadinessPanel';
import { MilestoneList } from '../components/overview/MilestoneList';
import { ShaylaAdviceCard } from '../components/overview/ShaylaAdviceCard';

export const OverviewPage: React.FC = () => {
  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8">
      <OverviewHero />
      <OverviewMetrics />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <JourneyHeatmap />
        <WeeklyTrend />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <ReadinessPanel />
        <div className="grid gap-6">
          <MilestoneList />
          <ShaylaAdviceCard />
        </div>
      </div>
    </div>
  );
};
