import React, { useState } from 'react';
import { useUIStore } from '../../app/store/useUIStore';
import { navigateToPath, sectionToPath } from '../../utils/navigation';
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
  Sparkles,
  Code2,
  TrendingUp,
  Building2,
  CalendarCheck,
  GitFork,
  PlugZap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, activeSection, setActiveSection } = useUIStore();
  const [aiToolsExpanded, setAiToolsExpanded] = useState(true);

  const coreTrackerItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: Gauge },
    { id: 'ai_brain', label: 'AI Brain', icon: Brain },
    { id: 'smart_planner', label: 'Smart Planner', icon: CalendarCheck },
    { id: 'placement_os', label: 'Placement OS', icon: Building2 },
    { id: 'placement_calendar', label: 'Placement Calendar', icon: CalendarClock },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'companies', label: 'Target Companies', icon: Building2 },
  ];

  const prepItems = [
    { id: 'roadmap', label: 'Roadmap', icon: BadgeCheck },
    { id: 'dsa_tracker', label: 'DSA Tracker', icon: ListChecks },
    { id: 'skillrack', label: 'SkillRack', icon: FlaskConical },
    { id: 'aptitude', label: 'Aptitude', icon: Brain },
    { id: 'sql', label: 'SQL', icon: Sigma },
    { id: 'cscore', label: 'CS Core', icon: BookOpen },
    { id: 'skill_tree', label: 'Skill Tree', icon: GitFork },
  ];

  const assetsItems = [
    { id: 'resume', label: 'Resume Studio', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: PlugZap },
    { id: 'projects', label: 'Projects Showcase', icon: FolderKanban },
    { id: 'german', label: 'German Academy', icon: Languages },
    { id: 'achievements', label: 'Achievements', icon: PartyPopper },
    { id: 'history', label: 'History Logs', icon: History }
  ];

  const aiToolsItems = [
    { id: 'ai', label: 'Shayla AI Mentor', icon: Bot },
    { id: 'interview_coach', label: 'Interview Coach', icon: Bot },
    { id: 'coding_mentor', label: 'Coding Mentor', icon: Code2 },
    { id: 'career_intelligence', label: 'Career Intelligence', icon: TrendingUp },
    { id: 'ai_settings', label: 'AI Settings', icon: Settings2 },
    { id: 'shayla_memory', label: 'Shayla Memory', icon: Brain },
    { id: 'ai_playground', label: 'AI Playground', icon: Sparkles },
    { id: 'ai_benchmark', label: 'AI Benchmark', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const renderNavGroup = (title: string, items: typeof coreTrackerItems, forceShow = true) => {
    if (!forceShow) return null;
    return (
      <div className="flex flex-col gap-1 mt-3">
        {!sidebarCollapsed && (
          <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest px-3 py-1 selection:bg-transparent">
            {title}
          </span>
        )}
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              const path = sectionToPath[item.id];
              if (path) {
                navigateToPath(path);
              } else {
                setActiveSection(item.id);
              }
            }}
            className={`nav-chip mb-0.5 text-left text-sm font-medium ${
              activeSection === item.id ? 'nav-chip--active' : 'text-textSecondary'
            }`}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>
    );
  };

  return (
    <aside
      className={`hidden flex-col border-r border-border-subtle bg-bgSurface/80 backdrop-blur-xl md:flex shell-sidebar ${
        sidebarCollapsed ? 'shell-sidebar--collapsed' : ''
      }`}
    >
      {/* Title Header */}
      <div className="flex h-16 items-center justify-between border-b border-border-subtle px-4 shrink-0">
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

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 select-none flex flex-col gap-2">
        {renderNavGroup('Core Tracker', coreTrackerItems)}
        {renderNavGroup('Placement Prep', prepItems)}
        {renderNavGroup('Career Assets', assetsItems)}

        {/* Collapsible Advanced AI Tools */}
        <div className="flex flex-col gap-1 mt-3">
          {!sidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setAiToolsExpanded(!aiToolsExpanded)}
              className="flex w-full items-center justify-between text-left text-[9px] font-bold text-textMuted uppercase tracking-widest px-3 py-1 hover:text-accentPurple transition select-none"
            >
              <span>AI & Advanced Tools</span>
              {aiToolsExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
          ) : (
            <div className="border-t border-white/5 my-1" />
          )}
          {renderNavGroup('AI & Advanced Tools', aiToolsItems, sidebarCollapsed || aiToolsExpanded)}
        </div>
      </nav>

      {/* Bottom Settings Link */}
      <div className="border-t border-border-subtle p-3 shrink-0">
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
