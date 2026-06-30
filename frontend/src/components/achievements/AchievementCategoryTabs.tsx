import React from 'react';
import { AchievementCategory } from '../../types/achievements';

interface AchievementCategoryTabsProps {
  activeCategory: AchievementCategory | 'all';
  onChangeCategory: (cat: AchievementCategory | 'all') => void;
}

export const AchievementCategoryTabs: React.FC<AchievementCategoryTabsProps> = ({
  activeCategory,
  onChangeCategory
}) => {
  const tabs: { id: AchievementCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Badges' },
    { id: 'daily', label: 'Daily Grind' },
    { id: 'dsa', label: 'Java DSA' },
    { id: 'sql', label: 'SQL queries' },
    { id: 'aptitude', label: 'Aptitude' },
    { id: 'learning', label: 'Study OS' },
    { id: 'german', label: 'Deutsch' },
    { id: 'projects', label: 'Projects' },
    { id: 'resume', label: 'Resume' },
    { id: 'placement', label: 'Placement' },
    { id: 'interview', label: 'STAR / interview' }
  ];

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-4 select-none">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChangeCategory(tab.id)}
          className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition ${
            activeCategory === tab.id
              ? 'border-accentBlue bg-accentBlue/10 text-textPrimary'
              : 'border-white/5 bg-white/[0.01] text-textSecondary hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
export default AchievementCategoryTabs;
