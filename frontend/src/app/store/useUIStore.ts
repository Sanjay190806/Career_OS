import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  currentDay: number;
  setCurrentDay: (day: number) => void;
  activeBadge: { id: string; name: string; emoji: string } | null;
  setActiveBadge: (badge: { id: string; name: string; emoji: string } | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  activeSection: 'overview',
  setActiveSection: (section) => set({ activeSection: section }),
  currentDay: 1,
  setCurrentDay: (day) => set({ currentDay: day }),
  activeBadge: null,
  setActiveBadge: (badge) => set({ activeBadge: badge }),
}));
