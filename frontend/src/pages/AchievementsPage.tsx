import React from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useCareerStore } from '../app/store/useCareerStore';
import { BADGES } from '../utils/achievementEngine';
import { getLevel } from '../utils/xpUtils';

export const AchievementsPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const { xp, unlockedBadges } = careerState;

  const currentLevelInfo = getLevel(xp);
  const nextLevelXp = currentLevelInfo.minXp + 1500; // Mock calculation bounds
  const levelProgress = Math.min(Math.round(((xp - currentLevelInfo.minXp) / (nextLevelXp - currentLevelInfo.minXp)) * 100), 100);

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 select-none">
      <SectionHeader
        title="Quests & Achievements Board"
        subtitle="Track unlocked badges, placement quest checklists, and career experience levels"
      />

      {/* Level XP Banner */}
      <Card className="flex flex-col gap-4 border-border-accent/15 bg-gradient-to-r from-accentPurple/5 to-bgCard">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-accentPurple uppercase tracking-wider block">Developer Level Status</span>
            <span className="text-xl font-black text-textPrimary mt-1 block">Level {currentLevelInfo.level}: {currentLevelInfo.name}</span>
          </div>
          <span className="text-xl font-bold font-mono text-textSecondary">{xp} XP Total</span>
        </div>
        <div>
          <div className="flex justify-between items-center text-[9px] text-textMuted font-bold mb-1.5 pl-0.5">
            <span>Progress to Next Level</span>
            <span>{levelProgress}%</span>
          </div>
          <ProgressBar value={levelProgress} color="var(--accent-purple)" />
        </div>
      </Card>

      {/* Badges Grid */}
      <div>
        <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block pl-0.5 mb-4">Badges collection ({Object.keys(unlockedBadges || {}).length}/{BADGES.length})</span>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGES.map((b) => {
            const isUnlocked = !!(unlockedBadges || {})[b.id];
            const unlockedDate = isUnlocked ? new Date((unlockedBadges || {})[b.id]).toLocaleDateString() : "";
            
            return (
              <Card
                key={b.id}
                className={`flex flex-col items-center text-center p-5 border transition-all ${
                  isUnlocked 
                    ? 'border-accentPurple/30 bg-bgCard/60 shadow-glow-purple' 
                    : 'border-border-subtle/50 opacity-40 bg-bgSurface/20'
                }`}
              >
                <span className={`text-4xl mb-3 ${isUnlocked ? 'animate-pulse' : 'filter grayscale'}`}>{b.emoji}</span>
                <span className="text-xs font-bold text-textPrimary leading-tight">{b.name}</span>
                <p className="text-[10px] text-textSecondary mt-1 leading-snug min-h-[32px]">{b.desc}</p>
                
                {isUnlocked ? (
                  <span className="text-[8px] text-accentPurple font-mono mt-3 uppercase tracking-wider font-extrabold">Unlocked {unlockedDate}</span>
                ) : (
                  <span className="text-[8px] text-textMuted font-mono mt-3 uppercase tracking-wider">Locked</span>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
