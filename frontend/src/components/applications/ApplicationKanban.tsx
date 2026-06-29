import React from 'react';
import { CareerApplication } from '../../types';
import { ApplicationCard } from './ApplicationCard';

interface ApplicationKanbanProps {
  applications: CareerApplication[];
  onCardClick: (app: CareerApplication) => void;
}

export const ApplicationKanban: React.FC<ApplicationKanbanProps> = ({
  applications,
  onCardClick
}) => {
  const columns: CareerApplication['status'][] = [
    'Wishlist',
    'Applied',
    'OA',
    'Interview',
    'HR',
    'Offer',
    'Rejected',
    'Ghosted'
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 select-none min-h-[450px]">
      {columns.map((col) => {
        const filtered = applications.filter((app) => app.status === col);
        
        return (
          <div key={col} className="flex-1 min-w-[200px] max-w-[240px] bg-bgCard/30 border border-border-subtle/50 rounded-2xl p-3 flex flex-col gap-3">
            {/* Column Header */}
            <div className="flex justify-between items-center px-1 border-b border-border-subtle/30 pb-2">
              <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">{col}</span>
              <span className="text-[9px] font-bold text-textMuted bg-bgSurface border border-border-subtle px-1.5 py-0.2 rounded-full">
                {filtered.length}
              </span>
            </div>
            
            {/* Cards List */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-0.5 max-h-[400px]">
              {filtered.length === 0 ? (
                <div className="text-center py-6 text-[10px] text-textMuted border border-dashed border-border-subtle/40 rounded-xl">
                  Drop card here
                </div>
              ) : (
                filtered.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onClick={() => onCardClick(app)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
