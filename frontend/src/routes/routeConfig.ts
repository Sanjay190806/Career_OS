export interface RouteDef {
  path: string;
  sectionId: string;
}

export const routes: RouteDef[] = [
  { path: '/', sectionId: 'overview' },
  { path: '/today', sectionId: 'today' },
  { path: '/roadmap', sectionId: 'roadmap' },
  { path: '/portfolio', sectionId: 'portfolio' },
  { path: '/admin', sectionId: 'admin' },
  { path: '/german', sectionId: 'german' },
  { path: '/coding-mentor', sectionId: 'coding_mentor' },
  { path: '/career-intelligence', sectionId: 'career_intelligence' },
  { path: '/integrations', sectionId: 'integrations' },
  { path: '/projects', sectionId: 'projects' },
  { path: '/settings', sectionId: 'settings' }
];
