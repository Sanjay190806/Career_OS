import React, { useMemo, useState } from 'react';
import { ApplicationStatusBoard } from '../components/placement/ApplicationStatusBoard';
import { CompanyCard } from '../components/placement/CompanyCard';
import { CompanyDetailPanel } from '../components/placement/CompanyDetailPanel';
import { InterviewTimeline } from '../components/placement/InterviewTimeline';
import { OATracker } from '../components/placement/OATracker';
import { PlacementReadinessCard } from '../components/placement/PlacementReadinessCard';
import { ResumeChecklist } from '../components/placement/ResumeChecklist';
import { usePlacementOS } from '../hooks/usePlacementOS';

export const PlacementOSPage: React.FC = () => {
  const { state, readiness, updateStatus, toggleChecklist } = usePlacementOS();
  const [selectedCompanyId, setSelectedCompanyId] = useState(state.companies[0]?.id || null);
  const selectedCompany = useMemo(() => state.companies.find((company) => company.id === selectedCompanyId) || null, [selectedCompanyId, state.companies]);
  const selectedStatus = state.applications.find((app) => app.companyId === selectedCompanyId)?.status || 'not_started';

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8">
      <div>
        <h1 className="text-3xl font-semibold text-textPrimary">Placement OS</h1>
        <p className="mt-2 max-w-3xl text-sm text-textSecondary">Track target companies, application status, OA/interview preparation, resume readiness, and the next action for placement execution.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <PlacementReadinessCard readiness={readiness} />
        <CompanyDetailPanel company={selectedCompany} status={selectedStatus} onStatusChange={(status) => selectedCompanyId && updateStatus(selectedCompanyId, status)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            status={state.applications.find((app) => app.companyId === company.id)?.status || 'not_started'}
            onSelect={() => setSelectedCompanyId(company.id)}
          />
        ))}
      </div>
      <ApplicationStatusBoard applications={state.applications} companies={state.companies} />
      <div className="grid gap-6 xl:grid-cols-3">
        <InterviewTimeline interviews={state.interviews} companies={state.companies} />
        <OATracker records={state.oaRecords} companies={state.companies} />
        <ResumeChecklist checklist={state.resumeChecklist} onToggle={toggleChecklist} />
      </div>
    </div>
  );
};
