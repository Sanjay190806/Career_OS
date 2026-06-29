import { create } from 'zustand';
import { DailyLog } from '../../types';
import { useCareerStore } from './useCareerStore';

interface DailyLogStoreState {
  selectedDay: number;
  setSelectedDay: (day: number) => void;
  saveLog: (day: number, log: Partial<DailyLog>) => void;
}

export const useDailyLogStore = create<DailyLogStoreState>((set) => ({
  selectedDay: 1,
  setSelectedDay: (selectedDay) => set({ selectedDay }),
  saveLog: (day, log) => {
    // Bridges to persistent useCareerStore
    useCareerStore.getState().updateDailyLog(day, log);
  }
}));
