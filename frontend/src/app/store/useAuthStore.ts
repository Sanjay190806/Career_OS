import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; email?: string } | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  user: { name: 'Sanju' },
  logout: () => set({ isAuthenticated: false, user: null })
}));
