import React from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ResumeScoreCard } from '../components/resume/ResumeScoreCard';
import { ResumeChecklist } from '../components/resume/ResumeChecklist';
import { ResumeVersions } from '../components/resume/ResumeVersions';
import { ResumeKeywordPanel } from '../components/resume/ResumeKeywordPanel';
import { Card } from '../components/ui/Card';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';


export const ResumePage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="ATS Resume Builder Studio"
        subtitle="Verify target keywords and completeness metrics to optimize recruitment passes"
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 border-accentPurple/20 bg-accentPurple/10 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accentPurple">Shayla AI Mentor</p>
          <h3 className="mt-1 text-base font-semibold text-textPrimary">Resume readiness coach</h3>
        </div>
        <ShaylaPromptButton prompt="Review my resume readiness using current tracker context. Be direct, ATS-focused, and give the top 3 improvements.">
          Review resume readiness
        </ShaylaPromptButton>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: animated score and versions list */}
        <div className="flex flex-col gap-6">
          <ResumeScoreCard />
          <ResumeVersions />
        </div>

        {/* Center column: core completeness checklists */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ResumeChecklist />
          <ResumeKeywordPanel />
        </div>
      </div>
    </div>
  );
};
