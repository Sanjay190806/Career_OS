export interface RouteDef {
  path: string;
  sectionId: string;
}

export const routes: RouteDef[] = [
  { path: '/', sectionId: 'overview' },
  { path: '/today', sectionId: 'today' },
  { path: '/roadmap', sectionId: 'roadmap' },
  { path: '/settings', sectionId: 'settings' }
];
