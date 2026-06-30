export interface RouteDef {
  path: string;
  sectionId: string;
}

export const routes: RouteDef[] = [
  { path: '/', sectionId: 'overview' },
  { path: '/today', sectionId: 'today' },
  { path: '/ai-brain', sectionId: 'ai_brain' },
  { path: '/smart-planner', sectionId: 'smart_planner' },
  { path: '/placement-os', sectionId: 'placement_os' },
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
