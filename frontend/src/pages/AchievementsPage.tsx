import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useCareerStore } from '../app/store/useCareerStore';
import { useAchievements } from '../hooks/useAchievements';
import { achievementService } from '../services/achievementService';
import { AchievementCategoryTabs } from '../components/achievements/AchievementCategoryTabs';
import { AchievementGrid } from '../components/achievements/AchievementGrid';
import { AchievementProgressStrip } from '../components/achievements/AchievementProgressStrip';
import { AchievementUnlockModal } from '../components/achievements/AchievementUnlockModal';
import { AchievementCategory } from '../types/achievements';
export const AchievementsPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const { achievements, claimReward, unlockedIds, claimedIds } = useAchievements();
  
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [activeUnlockId, setActiveUnlockId] = useState<string | null>(null);

  // Sync and check for new achievements when opening page
  useEffect(() => {
    achievementService.evaluateAll(careerState);
  }, [careerState]);

  // Listen for real-time achievement unlock event triggers
  useEffect(() => {
    const handleUnlocked = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; title: string }>;
      setActiveUnlockId(customEvent.detail.id);
    };

    window.addEventListener('achievement_unlocked', handleUnlocked);
    return () => window.removeEventListener('achievement_unlocked', handleUnlocked);
  }, []);

  const filteredAchievements = achievements.filter((a) => {
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 select-none">
      <SectionHeader
        title="Quests & Achievements Board"
        subtitle="Track unlocked badges, placement quest checklists, and career experience levels"
      />

      {/* Rarity & Completion Stats Progress Strip */}
      <AchievementProgressStrip />

      {/* Filter category tabs */}
      <AchievementCategoryTabs
        activeCategory={activeCategory}
        onChangeCategory={setActiveCategory}
      />

      {/* Grid displaying active collection */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center pl-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-textSecondary">
            Badges Grid ({filteredAchievements.filter(a => unlockedIds.includes(a.id)).length} / {filteredAchievements.length})
          </span>
        </div>

        <AchievementGrid
          achievements={filteredAchievements}
          onClaim={claimReward}
          unlockedIds={unlockedIds}
          claimedIds={claimedIds}
        />
      </div>

      {/* Unlock alert modal popup */}
      <AchievementUnlockModal
        unlockedId={activeUnlockId}
        onClose={() => setActiveUnlockId(null)}
        onClaim={claimReward}
      />
    </div>
  );
};
export default AchievementsPage;
