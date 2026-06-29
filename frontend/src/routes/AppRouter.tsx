import React, { useEffect, useMemo } from 'react';
import { useUIStore } from '../app/store/useUIStore';
import { AppShell } from '../components/layout/AppShell';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { LandingPage } from '../pages/LandingPage';
import { OverviewPage } from '../pages/OverviewPage';
import { TodayPage } from '../pages/TodayPage';
import { RoadmapPage } from '../pages/RoadmapPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ResumePage } from '../pages/ResumePage';
import { ApplicationsPage } from '../pages/ApplicationsPage';
import { CalendarFocusPage } from '../pages/CalendarFocusPage';
import { ShaylaAIPage } from '../pages/ShaylaAIPage';
import { AISettingsPage } from '../pages/AISettingsPage';
import { ShaylaMemoryPage } from '../pages/ShaylaMemoryPage';
import { GermanPage } from '../pages/GermanPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { AIPlaygroundPage } from '../pages/AIPlaygroundPage';
import { AIBenchmarkPage } from '../pages/AIBenchmarkPage';
import { PortfolioModePage } from '../pages/PortfolioModePage';
import { AchievementsPage } from '../pages/AchievementsPage';
import { HistoryPage } from '../pages/HistoryPage';
import { SQLPage } from '../pages/SQLPage';
import { AptitudePage } from '../pages/AptitudePage';
import { CSCorePage } from '../pages/CSCorePage';
import { SkillRackPage } from '../pages/SkillRackPage';
import { DSATrackerPage } from '../pages/DSATrackerPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const pathToSection: Record<string, string> = {
  '/dashboard': 'overview',
  '/overview': 'overview',
  '/today': 'today',
  '/roadmap': 'roadmap',
  '/ai': 'ai',
  '/shayla': 'ai',
  '/ai-settings': 'ai_settings',
  '/shayla-memory': 'shayla_memory',
  '/ai-playground': 'ai_playground',
  '/playground': 'ai_playground',
  '/ai-benchmark': 'ai_benchmark',
  '/benchmark': 'ai_benchmark',
  '/german': 'german',
  '/analytics': 'analytics',
  '/reports': 'reports',
  '/dsa-tracker': 'dsa_tracker',
  '/skillrack': 'skillrack',
  '/aptitude': 'aptitude',
  '/sql': 'sql',
  '/cscore': 'cscore',
  '/projects': 'projects',
  '/resume': 'resume',
  '/applications': 'applications',
  '/calendar': 'calendar',
  '/achievements': 'achievements',
  '/history': 'history',
  '/settings': 'settings',
};

function resolveSection(pathname: string): string {
  return pathToSection[pathname] || 'overview';
}

export const AppRouter: React.FC = () => {
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  const currentSection = useMemo(() => resolveSection(pathname), [pathname]);
  const isLanding = pathname === '/';

  useEffect(() => {
    if (!isLanding) {
      setActiveSection(currentSection);
    }
  }, [currentSection, isLanding, setActiveSection]);

  useEffect(() => {
    const onPopState = () => {
      const nextPath = window.location.pathname;
      if (nextPath === '/') return;
      setActiveSection(resolveSection(nextPath));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setActiveSection]);

  const isPortfolio = pathname === '/portfolio';

  if (isLanding) {
    return (
      <ErrorBoundary>
        <LandingPage />
      </ErrorBoundary>
    );
  }

  if (isPortfolio) {
    return (
      <ErrorBoundary>
        <PortfolioModePage />
      </ErrorBoundary>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewPage />;
      case 'today':
        return <TodayPage />;
      case 'roadmap':
        return <RoadmapPage />;
      case 'ai':
        return <ShaylaAIPage />;
      case 'ai_settings':
        return <AISettingsPage />;
      case 'shayla_memory':
        return <ShaylaMemoryPage />;
      case 'ai_playground':
        return <AIPlaygroundPage />;
      case 'ai_benchmark':
        return <AIBenchmarkPage />;
      case 'german':
        return <GermanPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'dsa_tracker':
        return <DSATrackerPage />;
      case 'skillrack':
        return <SkillRackPage />;
      case 'aptitude':
        return <AptitudePage />;
      case 'sql':
        return <SQLPage />;
      case 'cscore':
        return <CSCorePage />;
      case 'projects':
        return <ProjectsPage />;
      case 'resume':
        return <ResumePage />;
      case 'applications':
        return <ApplicationsPage />;
      case 'calendar':
        return <CalendarFocusPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <ErrorBoundary>
      <AppShell>
        {renderSection()}
      </AppShell>
    </ErrorBoundary>
  );
};
