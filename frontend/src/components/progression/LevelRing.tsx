import React from 'react';

interface LevelRingProps {
  currentXp: number;
  level: number;
  size?: number;
  strokeWidth?: number;
}

export const LevelRing: React.FC<LevelRingProps> = ({
  currentXp,
  level,
  size = 50,
  strokeWidth = 4
}) => {
  const getLevelXp = (lvl: number) => lvl * 500;
  const xpNeeded = getLevelXp(level);
  
  const getPrevLevelXpSum = (lvl: number) => {
    let sum = 0;
    for (let i = 1; i < lvl; i++) {
      sum += i * 500;
    }
    return sum;
  };

  const prevXpSum = getPrevLevelXpSum(level);
  const xpInLevel = Math.max(0, currentXp - prevXpSum);
  const percentage = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background tracking track circle */}
        <circle
          className="text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Highlight progress circle */}
        <circle
          className="text-accentBlue transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[10px] font-black text-textPrimary leading-none">{level}</span>
        <span className="text-[7px] text-textMuted uppercase font-bold mt-0.5">LVL</span>
      </div>
    </div>
  );
};
export default LevelRing;
