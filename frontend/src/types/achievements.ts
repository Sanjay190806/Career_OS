import { CareerState } from './index';

export interface XPThreshold {
  readonly level: number;
  readonly name: string;
  readonly minXp: number;
  readonly color: string;
}

export interface Badge {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly desc: string;
  readonly check: (state: Partial<CareerState>) => boolean;
}

export interface AchievementState {
  xp: number;
  level: number;
  badges: string[];
  unlockedAt: Record<string, string>;
}
