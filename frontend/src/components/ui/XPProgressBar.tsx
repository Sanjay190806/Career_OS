import React from 'react';

interface XPProgressBarProps {
  currentXp: number;
  level: number;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({ currentXp, level }) => {
  // Simple RPG level math
  const getLevelXp = (lvl: number) => lvl * 500; // e.g. Level 1 needs 500, Level 2 needs 1000
  const xpNeeded = getLevelXp(level);
  
  // XP in current level
  const getPrevLevelXpSum = (lvl: number) => {
    let sum = 0;
    for (let i = 1; i < lvl; i++) {
      sum += i * 500;
    }
    return sum;
  };

  const prevXpSum = getPrevLevelXpSum(level);
  const xpInLevel = Math.max(0, currentXp - prevXpSum);
  const percentage = Math.min(100, Math.max(0, Math.round((xpInLevel / xpNeeded) * 100)));

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-textSecondary uppercase">
        <span>LVL {level}</span>
        <span>{xpInLevel} / {xpNeeded} XP</span>
      </div>
      <div className="xp-bar-bg w-full">
        <div className="xp-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};
export default XPProgressBar;
