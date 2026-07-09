import React, { useEffect, lazy, Suspense } from 'react';
import { useUIStore } from '../app/store/useUIStore';
import { AppShell } from '../components/layout/AppShell';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { PageLoadingFallback } from '../components/ui/PageLoadingFallback';
import { pathToSection, sectionToPath } from '../utils/navigation';
import { useAuthStore } from '../app/store/useAuthStore';

// Public pages are statically imported for zero-latency initial loads
import { PortfolioModePage } from '../pages/PortfolioModePage';
import { PlacementDisciplinePage } from '../pages/PlacementDisciplinePage';

// Workspace console sub-pages are lazy loaded
const AIBrainPage = lazy(() => import('../pages/AIBrainPage').then(m => ({ default: m.AIBrainPage })));
const SmartPlannerPage = lazy(() => import('../pages/SmartPlannerPage').then(m => ({ default: m.SmartPlannerPage })));
const LearningOSPage = lazy(() => import('../pages/LearningOSPage').then(m => ({ default: m.LearningOSPage })));
const RoadmapPage = lazy(() => import('../pages/RoadmapPage').then(m => ({ default: m.RoadmapPage })));
const ShaylaAIPage = lazy(() => import('../pages/ShaylaAIPage').then(m => ({ default: m.ShaylaAIPage })));
const AISettingsPage = lazy(() => import('../pages/AISettingsPage').then(m => ({ default: m.AISettingsPage })));
const ShaylaMemoryPage = lazy(() => import('../pages/ShaylaMemoryPage').then(m => ({ default: m.ShaylaMemoryPage })));
const AIPlaygroundPage = lazy(() => import('../pages/AIPlaygroundPage').then(m => ({ default: m.AIPlaygroundPage })));
const AIBenchmarkPage = lazy(() => import('../pages/AIBenchmarkPage').then(m => ({ default: m.AIBenchmarkPage })));
const GermanPage = lazy(() => import('../pages/GermanPage').then(m => ({ default: m.GermanPage })));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ProjectsPage = lazy(() => import('../pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const CodingMentorPage = lazy(() => import('../pages/CodingMentorPage').then(m => ({ default: m.CodingMentorPage })));
const CareerIntelligencePage = lazy(() => import('../pages/CareerIntelligencePage').then(m => ({ default: m.CareerIntelligencePage })));
const IntegrationsPage = lazy(() => import('../pages/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const ApplicationsPage = lazy(() => import('../pages/ApplicationsPage').then(m => ({ default: m.ApplicationsPage })));
const CalendarFocusPage = lazy(() => import('../pages/CalendarFocusPage').then(m => ({ default: m.CalendarFocusPage })));
const PlacementCalendarPage = lazy(() => import('../pages/PlacementCalendarPage').then(m => ({ default: m.PlacementCalendarPage })));
const SkillTreePage = lazy(() => import('../pages/SkillTreePage').then(m => ({ default: m.SkillTreePage })));
const AchievementsPage = lazy(() => import('../pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const AdminPage = lazy(() => import('../pages/AdminPage').then(m => ({ default: m.AdminPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const OfflinePage = lazy(() => import('../pages/OfflinePage').then(m => ({ default: m.OfflinePage })));
const MockInterviewOSPage = lazy(() => import('../pages/MockInterviewOSPage').then(m => ({ default: m.MockInterviewOSPage })));
const CompanyIntelligencePage = lazy(() => import('../pages/CompanyIntelligencePage').then(m => ({ default: m.CompanyIntelligencePage })));
const PortfolioOSPage = lazy(() => import('../pages/PortfolioOSPage').then(m => ({ default: m.PortfolioOSPage })));
const AIMentorPage = lazy(() => import('../pages/AIMentorPage').then(m => ({ default: m.AIMentorPage })));
const AuthHomePage = lazy(() => import('../pages/auth/AuthHomePage').then(m => ({ default: m.AuthHomePage })));
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('../pages/auth/SignupPage').then(m => ({ default: m.SignupPage })));
const AuthCallbackPage = lazy(() => import('../pages/auth/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })));
const OnboardingPage = lazy(() => import('../pages/onboarding/OnboardingPage').then(m => ({ default: m.OnboardingPage })));



export const AppRouter: React.FC = () => {
  const activeSection = useUIStore((s) => s.activeSection);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const [pathname, setPathname] = React.useState(typeof window !== 'undefined' ? window.location.pathname : '/');
  const [hasSyncedUrl, setHasSyncedUrl] = React.useState(false);
  const initializeAuth = useAuthStore((s) => s.initialize);

  const isLaunch = pathname === '/' || pathname === '/landing' || pathname.endsWith('index.html') || pathname === '';
  const isPortfolio = pathname === '/portfolio';
  const isOffline = pathname === '/offline';
  const isAuthRoute = ['/auth', '/login', '/signup', '/auth/callback', '/onboarding'].includes(pathname);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 1. Sync URL path -> Store's activeSection on mount and popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const nextPath = window.location.pathname;
      setPathname(nextPath);
      if (nextPath === '/' || nextPath === '/landing' || nextPath.endsWith('index.html') || nextPath === '') {
        setActiveSection('overview');
      } else if (nextPath === '/portfolio' || ['/auth', '/login', '/signup', '/auth/callback', '/onboarding'].includes(nextPath)) {
        // public/special routes
      } else {
        const sect = pathToSection[nextPath];
        if (sect) {
          setActiveSection(sect);
        }
      }
      setHasSyncedUrl(true);
    };

    // Run once on mount to handle initial deep link
    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [setActiveSection]);

  // 2. Sync section changes -> URL only after the current URL has initialized the store.
  useEffect(() => {
    if (!hasSyncedUrl) return;
    if (isLaunch || isPortfolio || isAuthRoute) return;
    const currentSection = pathToSection[pathname] || 'overview';
    if (activeSection === currentSection) return;
    const targetPath = sectionToPath[activeSection];
    if (targetPath && window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
      setPathname(targetPath);
    }
  }, [activeSection, hasSyncedUrl, isLaunch, isPortfolio, pathname]);

  if (isLaunch) {
    return (
      <ErrorBoundary>
        <AppShell>
          <PlacementDisciplinePage />
        </AppShell>
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

  if (isOffline) {
    return (
      <ErrorBoundary>
        <OfflinePage />
      </ErrorBoundary>
    );
  }

  if (isAuthRoute) {
    const authPage = pathname === '/login'
      ? <LoginPage />
      : pathname === '/signup'
        ? <SignupPage />
        : pathname === '/auth/callback'
          ? <AuthCallbackPage />
          : pathname === '/onboarding'
            ? <OnboardingPage />
            : <AuthHomePage />;
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>{authPage}</Suspense>
      </ErrorBoundary>
    );
  }

  const renderSection = () => {
    const currentActive = isLaunch ? 'overview' : isPortfolio ? 'portfolio' : activeSection;
    switch (currentActive) {
      case 'overview':
        return <PlacementDisciplinePage />;
      case 'today':
        return <PlacementDisciplinePage />;
      case 'ai_brain':
        return <AIBrainPage />;
      case 'smart_planner':
        return <SmartPlannerPage />;
      case 'placement_os':
        return <PlacementDisciplinePage />;
      case 'learning_os':
        return <LearningOSPage />;
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
        return <PlacementDisciplinePage />;
      case 'portfolio':
        return <PortfolioModePage />;
      case 'dsa_tracker':
        return <PlacementDisciplinePage />;
      case 'skillrack':
        return <PlacementDisciplinePage />;
      case 'leetcode':
        return <PlacementDisciplinePage />;
      case 'aptitude':
        return <PlacementDisciplinePage />;
      case 'sql':
        return <PlacementDisciplinePage />;
      case 'cscore':
        return <PlacementDisciplinePage />;
      case 'projects':
        return <ProjectsPage />;
      case 'coding_mentor':
        return <CodingMentorPage />;
      case 'career_intelligence':
        return <CareerIntelligencePage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'resume':
        return <PlacementDisciplinePage />;
      case 'interview_coach':
        return <PlacementDisciplinePage />;
      case 'mistakes':
        return <PlacementDisciplinePage />;
      case 'applications':
        return <ApplicationsPage />;
      case 'calendar':
        return <CalendarFocusPage />;
      case 'placement_calendar':
        return <PlacementCalendarPage />;
      case 'companies':
        return <PlacementDisciplinePage />;
      case 'skill_tree':
        return <SkillTreePage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'history':
        return <PlacementDisciplinePage />;
      case 'settings':
        return <PlacementDisciplinePage />;
      case 'admin':
        return <AdminPage />;
      case 'mock_interview_os':
        return <MockInterviewOSPage />;
      case 'company_intelligence':
        return <CompanyIntelligencePage />;
      case 'portfolio_os':
        return <PortfolioOSPage />;
      case 'ai_mentor':
        return <AIMentorPage />;

      default:
        return <NotFoundPage />;
    }
  };

  return (
    <ErrorBoundary>
      <AppShell>
        <Suspense fallback={<PageLoadingFallback />}>
          {renderSection()}
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  );
};
