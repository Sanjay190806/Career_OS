import { request } from './apiClient';
import { PlacementReadiness } from '../types';

export interface AnalyticsService {
  getReadiness: () => Promise<PlacementReadiness>;
}

export const analyticsService: AnalyticsService = {
  getReadiness: () => request<PlacementReadiness>('/analytics/readiness')
};
