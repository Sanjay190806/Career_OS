import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PortfolioReadinessScore } from '../components/portfolio/PortfolioReadinessScore';
import { PortfolioPrivacyWarning } from '../components/portfolio/PortfolioPrivacyWarning';
import { PortfolioVisibilityPanel } from '../components/portfolio/PortfolioVisibilityPanel';
import { PublicPortfolioPreview } from '../components/portfolio/PublicPortfolioPreview';
import { CaseStudyBuilder } from '../components/portfolio/CaseStudyBuilder';
import { RecruiterSummaryBuilder } from '../components/portfolio/RecruiterSummaryBuilder';
import { GitHubOSPanel } from '../components/portfolio/GitHubOSPanel';
import { LinkedInDraftBuilder } from '../components/portfolio/LinkedInDraftBuilder';
import { Eye, ShieldAlert, Sparkles, FolderLock, Bot } from 'lucide-react';

type TabType = 'summaries' | 'case_studies' | 'github_os' | 'linkedin' | 'visibility' | 'preview';

export const PortfolioOSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('summaries');

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="Recruiter Portfolio OS & GitHub Coach"
        subtitle="Structure project case studies, audit GitHub clean code readiness guidelines, draft LinkedIn updates, and verify public profile visibility."
      />

      {/* Tabs list */}
      <div className="flex flex-wrap bg-white/5 border border-white/5 rounded-2xl p-1 text-xs font-black uppercase tracking-wider self-start select-none">
        <button
          onClick={() => setActiveTab('summaries')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'summaries' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>Recruiter Bio</span>
        </button>
        <button
          onClick={() => setActiveTab('case_studies')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'case_studies' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Case Studies</span>
        </button>
        <button
          onClick={() => setActiveTab('github_os')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'github_os' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <FolderLock className="h-4 w-4" />
          <span>GitHub OS</span>
        </button>
        <button
          onClick={() => setActiveTab('linkedin')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'linkedin' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>LinkedIn Assist</span>
        </button>
        <button
          onClick={() => setActiveTab('visibility')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'visibility' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Privacy Settings</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition ${
            activeTab === 'preview' ? 'bg-accentBlue text-white shadow-glow-blue/10' : 'text-textSecondary hover:bg-white/5'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Standalone Preview</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main workspace */}
        <div className="lg:col-span-2">
          {activeTab === 'summaries' && <RecruiterSummaryBuilder />}
          {activeTab === 'case_studies' && <CaseStudyBuilder />}
          {activeTab === 'github_os' && <GitHubOSPanel />}
          {activeTab === 'linkedin' && <LinkedInDraftBuilder />}
          {activeTab === 'visibility' && <PortfolioVisibilityPanel />}
          {activeTab === 'preview' && <PublicPortfolioPreview />}
        </div>

        {/* Right sidebar metrics */}
        <div className="flex flex-col gap-5">
          <PortfolioReadinessScore />
          <PortfolioPrivacyWarning />
        </div>
      </div>
    </div>
  );
};
export default PortfolioOSPage;
