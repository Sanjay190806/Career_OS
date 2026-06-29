import { request } from './apiClient';
import { CareerState } from '../types';

export interface SyncService {
  checkBackendHealth: () => Promise<boolean>;
  getBackendHealth: () => Promise<{
    api?: { status?: string };
    database?: { status?: string };
    groq?: { status?: string; model?: string };
    environment?: string;
    uptime?: number;
    timestamp?: string;
  } | null>;
  pullSnapshot: (userId: string) => Promise<CareerState | null>;
  pushSnapshot: (userId: string, data: CareerState) => Promise<{ success: boolean; updatedAt: string }>;
}

export const syncService: SyncService = {
  checkBackendHealth: async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
  getBackendHealth: async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/health`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },
  pullSnapshot: async (userId) => {
    try {
      const res = await request<{ data: any }>('/sync?userId=' + encodeURIComponent(userId));
      return res.data ? (res.data as CareerState) : null;
    } catch {
      return null;
    }
  },
  pushSnapshot: async (userId, data) => {
    return request<{ success: boolean; updatedAt: string }>('/sync', {
      method: 'POST',
      body: { userId, data }
    });
  }
};
