import { DEFAULT_PLACEMENT_COMPANIES } from '../data/defaultCompanies';
import { ApplicationStatus, OARecord, PlacementApplication, PlacementCompany, PlacementOSReadiness, PlacementRound } from '../types/placement';

export const PLACEMENT_OS_STORAGE_KEY = 'sanzz_os_placement_os_v1';

export interface PlacementOSState {
  companies: PlacementCompany[];
  applications: PlacementApplication[];
  interviews: PlacementRound[];
  oaRecords: OARecord[];
  resumeChecklist: Record<string, boolean>;
}

const defaultChecklist = {
  atsFormat: false,
  quantifiedBullets: false,
  projectLinks: false,
  skillsTailored: false,
  onePage: true,
  proofread: false
};

export function getDefaultPlacementOSState(): PlacementOSState {
  return {
    companies: DEFAULT_PLACEMENT_COMPANIES,
    applications: DEFAULT_PLACEMENT_COMPANIES.map((company) => ({
      id: `application-${company.id}`,
      companyId: company.id,
      status: company.priority === 'high' ? 'preparing' : 'not_started',
      updatedAt: new Date().toISOString(),
      nextAction: company.priority === 'high' ? `Prepare ${company.name} core round` : 'Keep in watchlist'
    })),
    interviews: [],
    oaRecords: [],
    resumeChecklist: defaultChecklist
  };
}

export function loadPlacementOS(): PlacementOSState {
  try {
    const raw = localStorage.getItem(PLACEMENT_OS_STORAGE_KEY);
    if (!raw) return getDefaultPlacementOSState();
    const parsed = JSON.parse(raw) as Partial<PlacementOSState>;
    return {
      companies: parsed.companies?.length ? parsed.companies : DEFAULT_PLACEMENT_COMPANIES,
      applications: parsed.applications || getDefaultPlacementOSState().applications,
      interviews: parsed.interviews || [],
      oaRecords: parsed.oaRecords || [],
      resumeChecklist: { ...defaultChecklist, ...(parsed.resumeChecklist || {}) }
    };
  } catch {
    return getDefaultPlacementOSState();
  }
}

export function savePlacementOS(state: PlacementOSState): void {
  try {
    localStorage.setItem(PLACEMENT_OS_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist Placement OS', error);
  }
}

export function updateApplicationStatus(state: PlacementOSState, companyId: string, status: ApplicationStatus): PlacementOSState {
  const existing = state.applications.find((app) => app.companyId === companyId);
  const nextApplication: PlacementApplication = {
    id: existing?.id || `application-${companyId}`,
    companyId,
    status,
    updatedAt: new Date().toISOString(),
    nextAction: status === 'applied' ? 'Watch for OA schedule' : status === 'interview_scheduled' ? 'Prepare project and HR answers' : existing?.nextAction || 'Continue preparation'
  };
  return {
    ...state,
    applications: existing
      ? state.applications.map((app) => app.companyId === companyId ? nextApplication : app)
      : [...state.applications, nextApplication]
  };
}

export function calculatePlacementReadiness(state: PlacementOSState): PlacementOSReadiness {
  const highPriorityPreparing = state.applications.filter((app) => {
    const company = state.companies.find((item) => item.id === app.companyId);
    return company?.priority === 'high' && app.status !== 'not_started';
  }).length;
  const checklistScore = Object.values(state.resumeChecklist).filter(Boolean).length / Object.keys(state.resumeChecklist).length;
  const interviewScore = Math.min(1, state.interviews.length / 4);
  const oaScore = Math.min(1, state.oaRecords.length / 4);
  const score = Math.round((highPriorityPreparing / 6) * 35 + checklistScore * 35 + interviewScore * 15 + oaScore * 15);

  return {
    score: Math.min(100, score),
    resumeScore: Math.round(checklistScore * 100),
    companyPrepScore: Math.min(100, Math.round((highPriorityPreparing / 6) * 100)),
    interviewScore: Math.round(interviewScore * 100),
    oaScore: Math.round(oaScore * 100),
    nextAction: checklistScore < 0.7 ? 'Finish resume checklist before applying broadly.' : 'Prepare the next high-priority company round.'
  };
}
