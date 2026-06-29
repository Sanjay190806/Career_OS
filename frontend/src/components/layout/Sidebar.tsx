import React from 'react';
import { useUIStore } from '../../app/store/useUIStore';
import {
  LayoutDashboard,
  Gauge,
  Languages,
  BadgeCheck,
  BarChart3,
  FileText,
  ListChecks,
  FlaskConical,
  Brain,
  Sigma,
  BookOpen,
  FolderKanban,
  CalendarClock,
  PartyPopper,
  History,
  Settings2,
  Menu,
  PanelLeftClose,
  Bot,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, activeSection, setActiveSection } = useUIStore();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: Gauge },
    { id: 'roadmap', label: 'Roadmap', icon: BadgeCheck },
    { id: 'ai', label: 'Shayla AI Mentor', icon: Bot },
    { id: 'ai_settings', label: 'AI Settings', icon: Settings2 },
    { id: 'shayla_memory', label: 'Shayla Memory', icon: Brain },
    { id: 'ai_playground', label: 'AI Playground', icon: Sparkles },
    { id: 'ai_benchmark', label: 'AI Benchmark', icon: BarChart3 },
    { id: 'german', label: 'German', icon: Languages },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'dsa_tracker', label: 'DSA Tracker', icon: ListChecks },
    { id: 'skillrack', label: 'SkillRack', icon: FlaskConical },
    { id: 'aptitude', label: 'Aptitude', icon: Brain },
    { id: 'sql', label: 'SQL', icon: Sigma },
    { id: 'cscore', label: 'CS Core', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'applications', label: 'Applications', icon: BadgeCheck },
    { id: 'calendar', label: 'Calendar', icon: CalendarClock },
    { id: 'achievements', label: 'Achievements', icon: PartyPopper },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <aside
      className={`hidden flex-col border-r border-border-subtle bg-bgSurface/80 backdrop-blur-xl md:flex shell-sidebar ${
        sidebarCollapsed ? 'shell-sidebar--collapsed' : ''
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4">
        {!sidebarCollapsed ? (
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-textMuted">Career OS</span>
            <span className="text-base font-semibold text-textPrimary">Sanju Tracker</span>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-white/5 text-accentBlue">
            <LayoutDashboard className="h-5 w-5" />
          </div>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border-subtle bg-white/5 text-textSecondary transition hover:border-border-accent hover:bg-white/10 hover:text-textPrimary"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id)}
            className={`nav-chip mb-1.5 text-left text-sm font-medium ${
              activeSection === item.id ? 'nav-chip--active' : 'text-textSecondary'
            }`}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-3">
        <button
          type="button"
          onClick={() => setActiveSection('settings')}
          className={`nav-chip text-left text-sm font-medium ${
            activeSection === 'settings' ? 'nav-chip--active' : 'text-textSecondary'
          }`}
          aria-current={activeSection === 'settings' ? 'page' : undefined}
        >
          <Settings2 className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
};
