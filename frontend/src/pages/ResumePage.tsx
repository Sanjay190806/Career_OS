import React, { useMemo, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { ResumeScoreCard } from '../components/resume/ResumeScoreCard';
import { ResumeChecklist } from '../components/resume/ResumeChecklist';
import { ResumeVersions } from '../components/resume/ResumeVersions';
import { ResumeKeywordPanel } from '../components/resume/ResumeKeywordPanel';
import { ResumeStudioTabs, ResumeStudioTab } from '../components/resume/ResumeStudioTabs';
import { ResumeBuilderPanel } from '../components/resume/ResumeBuilderPanel';
import { JobDescriptionAnalyzer } from '../components/resume/JobDescriptionAnalyzer';
import { BulletLab } from '../components/resume/BulletLab';
import { ATSKeywordMatcher } from '../components/resume/ATSKeywordMatcher';
import { RecruiterSimulation } from '../components/resume/RecruiterSimulation';
import { ResumeInterviewQuestions } from '../components/resume/ResumeInterviewQuestions';
import { ResumeScoreHistory } from '../components/resume/ResumeScoreHistory';
import { ResumeVersionCompare } from '../components/resume/ResumeVersionCompare';
import { ResumeSuggestionPreview } from '../components/resume/ResumeSuggestionPreview';
import { ResumeSuggestionConfirmation } from '../components/resume/ResumeSuggestionConfirmation';
import { StrictATSAnalyzer } from '../components/resume/StrictATSAnalyzer';
import { ATSAnalyzerPage } from '../components/resume/ATSAnalyzerPage';
import { useCareerStore } from '../app/store/useCareerStore';
import { useResumeStudioStore } from '../app/store/useResumeStudioStore';
import { buildResumeStudioContext, createTailoredVersionFromAnalysis } from '../utils/resumeStudioUtils';

export const ResumePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ResumeStudioTab>('overview');
  const careerState = useCareerStore((s) => s);
  const resumeStore = useResumeStudioStore((s) => s);
  const createTailoredVersion = useResumeStudioStore((s) => s.createTailoredVersion);

  const studioContext = useMemo(
    () => buildResumeStudioContext(careerState, resumeStore.selectedResumeVersion, resumeStore.lastJobDescription),
    [careerState, resumeStore.selectedResumeVersion, resumeStore.lastJobDescription]
  );

  const latestAnalysis = resumeStore.jobAnalyses[0] || null;
  const suggestions = latestAnalysis?.recommendations || studioContext.versionNotes;

  const handleConfirmTailor = () => {
    if (!latestAnalysis) return;
    createTailoredVersion(createTailoredVersionFromAnalysis(studioContext, latestAnalysis));
  };

  const content = useMemo(() => {
    switch (activeTab) {
      case 'builder':
        return <ResumeBuilderPanel />;
      case 'tailor':
        return (
          <div className="grid gap-6">
            <JobDescriptionAnalyzer />
            <Card className="flex flex-wrap gap-3 border-accentPurple/20 bg-accentPurple/5 p-4">
              <ShaylaPromptButton prompt={`Improve this bullet using my resume context. Selected version: ${resumeStore.selectedResumeVersion}. Job description summary: ${resumeStore.lastJobDescription || 'none'}.`}>
                Ask Shayla to improve this bullet
              </ShaylaPromptButton>
              <ShaylaPromptButton prompt={`Review my resume strictly but fairly. Selected version: ${resumeStore.selectedResumeVersion}. Missing keywords: ${studioContext.missingKeywords.join(', ') || 'none'}.`}>
                Ask Shayla to review this resume
              </ShaylaPromptButton>
              <ShaylaPromptButton prompt={`Tailor my resume for ${studioContext.currentTargetCompany || 'Zoho'} using my current resume and job description summary. Keep it placement-focused and truthful.`}>
                Ask Shayla to tailor for Zoho
              </ShaylaPromptButton>
              <ShaylaPromptButton prompt={`Generate interview questions from my resume. Selected version: ${resumeStore.selectedResumeVersion}. Target role: ${studioContext.currentTargetRole}.`}>
                Ask Shayla to generate interview questions
              </ShaylaPromptButton>
              <ShaylaPromptButton prompt={`Tell me the single highest-impact thing I should fix first in my resume. Be honest and specific.`}>
                Ask Shayla what to fix first
              </ShaylaPromptButton>
            </Card>
            <ResumeSuggestionPreview title="Tailor suggestions" items={suggestions} />
            <ResumeSuggestionConfirmation
              summary="Review the suggestions above, then confirm when you are ready to create a tailored version. Nothing is overwritten automatically."
              onConfirm={handleConfirmTailor}
              onCancel={() => setActiveTab('overview')}
            />
          </div>
        );
      case 'ats_analyzer':
        return <ATSAnalyzerPage />;
      case 'ats_strict':
        return <StrictATSAnalyzer />;
      case 'bullet':
        return <BulletLab />;
      case 'keywords':
        return (
          <div className="grid gap-6">
            <ATSKeywordMatcher />
            <ResumeKeywordPanel />
          </div>
        );
      case 'recruiter':
        return <RecruiterSimulation />;
      case 'interview':
        return <ResumeInterviewQuestions />;
      case 'versions':
        return <ResumeVersionCompare />;
      case 'history':
        return <ResumeScoreHistory />;
      case 'overview':
      default:
        return (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6">
              <ResumeScoreCard />
              <ResumeChecklist />
              <ResumeVersions />
            </div>
            <div className="flex flex-col gap-6">
              <ResumeVersionCompare />
              <ResumeScoreHistory />
            </div>
          </div>
        );
    }
  }, [activeTab, latestAnalysis, studioContext, suggestions]);

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="ATS Resume Builder Studio"
        subtitle="Analyze job descriptions, rewrite bullets, tailor versions, and track score history"
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 border-accentPurple/20 bg-accentPurple/10 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accentPurple">Shayla AI Mentor</p>
          <h3 className="mt-1 text-base font-semibold text-textPrimary">Resume readiness coach</h3>
        </div>
        <ShaylaPromptButton
          prompt={`Review my resume readiness using current tracker context. Selected version: ${resumeStore.selectedResumeVersion}. ATS score: ${studioContext.atsScore}%. Current target company: ${studioContext.currentTargetCompany}. Missing keywords: ${studioContext.missingKeywords.join(', ') || 'none'}.`}
        >
          Review resume readiness
        </ShaylaPromptButton>
      </Card>

      <ResumeStudioTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {content}
    </div>
  );
};
