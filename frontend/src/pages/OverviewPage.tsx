import React, { useState } from 'react';
import { OverviewHero } from '../components/overview/OverviewHero';
import { OverviewMetrics } from '../components/overview/OverviewMetrics';
import { WeeklyTrend } from '../components/overview/WeeklyTrend';
import { JourneyHeatmap } from '../components/overview/JourneyHeatmap';
import { ReadinessPanel } from '../components/overview/ReadinessPanel';
import { MilestoneList } from '../components/overview/MilestoneList';
import { ShaylaAdviceCard } from '../components/overview/ShaylaAdviceCard';
import { useCareerStore } from '../app/store/useCareerStore';
import { useAISettingsStore } from '../app/store/useAISettingsStore';
import { useShaylaAgentStore } from '../app/store/useShaylaAgentStore';
import { buildAgentContext } from '../utils/agentContextUtils';
import { generateDailyBriefing } from '../services/agentService';
import { DailyBriefingPanel } from '../components/shayla-agent/DailyBriefingPanel';
import { ShaylaBriefingResult } from '../types/shaylaAgent';

import { PhaseProgressBar } from '../components/ui/PhaseProgressBar';
import { MiniStreakStrip } from '../components/ui/MiniStreakStrip';
import { V16IntelligenceWidgets } from '../components/overview/V16IntelligenceWidgets';

export const OverviewPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const settings = useAISettingsStore((s) => s);
  const agentStore = useShaylaAgentStore((s) => s);
  const [briefing, setBriefing] = useState<ShaylaBriefingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateMorning = async () => {
    setLoading(true);
    try {
      const context = buildAgentContext(careerState);
      const result = await generateDailyBriefing('morning', context, {
        provider: settings.activeProvider,
        model: settings.activeModel,
        mode: settings.activeMode,
        streaming: settings.streamingEnabled,
      });
      setBriefing(result);
      agentStore.recordBriefing({
        id: `briefing-${Date.now()}`,
        kind: 'morning',
        title: result.title,
        summary: result.summary,
        generatedAt: result.generatedAt,
        fallbackUsed: result.fallbackUsed,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecovery = async () => {
    setLoading(true);
    try {
      const context = buildAgentContext(careerState);
      const result = await generateDailyBriefing('recovery', context, {
        provider: settings.activeProvider,
        model: settings.activeModel,
        mode: settings.activeMode,
        streaming: settings.streamingEnabled,
      });
      setBriefing(result);
      agentStore.recordBriefing({
        id: `briefing-${Date.now()}`,
        kind: 'recovery',
        title: result.title,
        summary: result.summary,
        generatedAt: result.generatedAt,
        fallbackUsed: result.fallbackUsed,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8">
      <OverviewHero />
      <PhaseProgressBar />
      <MiniStreakStrip />
      <V16IntelligenceWidgets />
      <DailyBriefingPanel

        briefing={briefing}
        history={agentStore.briefingHistory}
        loading={loading}
        onGenerateMorning={handleGenerateMorning}
        onGenerateRecovery={handleGenerateRecovery}
      />
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
