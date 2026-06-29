import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { ApplicationKanban } from '../components/applications/ApplicationKanban';
import { ApplicationTable } from '../components/applications/ApplicationTable';
import { ApplicationDrawer } from '../components/applications/ApplicationDrawer';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { useCareerStore } from '../app/store/useCareerStore';
import { CareerApplication } from '../types';

export const ApplicationsPage: React.FC = () => {
  const applications = useCareerStore((s) => s.applications);

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeApp, setActiveApp] = useState<CareerApplication | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCardClick = (app: CareerApplication) => {
    setActiveApp(app);
    setDrawerOpen(true);
  };

  // Compute metrics
  const total = applications.length;
  const offers = applications.filter(a => a.status === 'Offer').length;
  const interviews = applications.filter(a => a.status === 'Interview' || a.status === 'OA').length;
  const conversionRate = total > 0 ? Math.round((interviews / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      <SectionHeader
        title="Job Applications CRM"
        subtitle="Track recruitment pipelines, online assessments, and interview round status checkpoints"
        actions={
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={() => setViewMode(prev => prev === 'kanban' ? 'table' : 'kanban')}
              variant="outline"
              className="text-xs py-2 rounded-xl"
            >
              Toggle: {viewMode === 'kanban' ? "Table List" : "Kanban Board"}
            </Button>
            <Button onClick={() => setModalOpen(true)} className="text-xs py-2 rounded-xl shrink-0">
              + Add Application
            </Button>
          </div>
        }
      />

      {/* Analytics stats banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        <div className="glass-card p-4 rounded-xl border border-border-subtle bg-bgCard/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block">Total Applied</span>
            <span className="text-xl font-bold text-textPrimary font-mono mt-0.5">{total}</span>
          </div>
          <span className="text-2xl">💼</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-border-subtle bg-bgCard/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block">Interviews/OAs</span>
            <span className="text-xl font-bold text-accentYellow font-mono mt-0.5">{interviews}</span>
          </div>
          <span className="text-2xl">🤝</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-border-subtle bg-bgCard/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block">Conversion Rate</span>
            <span className="text-xl font-bold text-accentBlue font-mono mt-0.5">{conversionRate}%</span>
          </div>
          <span className="text-2xl">📈</span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-border-subtle bg-bgCard/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider block">Offers Received</span>
            <span className="text-xl font-bold text-accentEmerald font-mono mt-0.5">{offers}</span>
          </div>
          <span className="text-2xl">🎉</span>
        </div>
      </div>

      {/* Main pipeline view */}
      {viewMode === 'kanban' ? (
        <ApplicationKanban applications={applications} onCardClick={handleCardClick} />
      ) : (
        <ApplicationTable applications={applications} onRowClick={handleCardClick} />
      )}

      {/* Slide-out details drawer */}
      {activeApp && (
        <ApplicationDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          application={activeApp}
        />
      )}

      {/* Add new app modal overlay */}
      <ApplicationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
