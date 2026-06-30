import { useCareerStore } from '../app/store/useCareerStore';
import { ParsedCommand } from './commandParser';
import { buildAIBrainSummary, saveAIBrainSummary } from '../services/aiBrainService';
import { completeSmartTask, generateSmartPlan, loadSmartPlan, saveSmartPlan } from '../services/smartPlannerService';
import { calculatePlacementReadiness, loadPlacementOS, savePlacementOS, updateApplicationStatus } from '../services/placementService';
import { ApplicationStatus } from '../types/placement';

export function executeCommand(cmd: ParsedCommand): boolean {
  try {
    const store = useCareerStore.getState();

    switch (cmd.type) {
      case 'addApplication': {
        const { company, role, status } = cmd.payload;
        
        let normalizedStatus: 'Wishlist' | 'Applied' | 'OA' | 'Interview' | 'HR' | 'Offer' | 'Rejected' | 'Ghosted' = 'Applied';
        const st = (status || '').toLowerCase();
        if (st.includes('wish') || st.includes('want')) normalizedStatus = 'Wishlist';
        else if (st.includes('oa') || st.includes('test')) normalizedStatus = 'OA';
        else if (st.includes('interview') || st.includes('round')) normalizedStatus = 'Interview';
        else if (st.includes('hr')) normalizedStatus = 'HR';
        else if (st.includes('offer')) normalizedStatus = 'Offer';
        else if (st.includes('reject')) normalizedStatus = 'Rejected';
        else if (st.includes('ghost')) normalizedStatus = 'Ghosted';

        store.addApplication({
          id: `app-${Date.now()}`,
          company,
          role,
          status: normalizedStatus,
          date: new Date().toISOString().split('T')[0],
          salary: ''
        });
        return true;
      }

      case 'updateGermanProgress': {
        const { minutes } = cmd.payload;
        store.updateGermanMinutes(minutes, undefined, 'Studied German vocabulary and phrases');
        return true;
      }

      case 'markCSCoreTopic': {
        const { topic, subject } = cmd.payload;
        store.updateCSCoreTopic(subject, topic, {
          completed: true,
          confidence: 4,
          interviewReady: true,
          lastRevisedAt: new Date().toISOString()
        });
        return true;
      }

      case 'completeDailyTask': {
        const { task } = cmd.payload;
        const currentDay = useCareerStore.getState().userProfile.totalDays || 1;
        const todayLog = useCareerStore.getState().dailyLogs[String(currentDay)];

        const note = todayLog?.note || '';
        const updatedNote = note ? `${note}\n- [x] ${task}` : `- [x] ${task}`;
        store.updateDailyLog(currentDay, { note: updatedNote });
        return true;
      }

      case 'refreshAIBrain': {
        saveAIBrainSummary(buildAIBrainSummary(useCareerStore.getState()));
        return true;
      }

      case 'generateTodayPlan': {
        const mode = cmd.payload?.mode || 'normal';
        const summary = buildAIBrainSummary(useCareerStore.getState());
        saveSmartPlan(generateSmartPlan(summary, mode));
        return true;
      }

      case 'completeSmartTask': {
        const plan = loadSmartPlan();
        if (!plan) return false;
        const category = cmd.payload?.category;
        const target = plan.tasks.find((task) => task.status !== 'completed' && (!category || task.category === category));
        if (!target) return false;
        saveSmartPlan(completeSmartTask(plan, target.id));
        return true;
      }

      case 'showPlacementReadiness':
      case 'recommendNextAction': {
        const placement = loadPlacementOS();
        calculatePlacementReadiness(placement);
        buildAIBrainSummary(useCareerStore.getState());
        return true;
      }

      case 'updateCompanyStatus': {
        const placement = loadPlacementOS();
        const companyName = String(cmd.payload?.company || '').toLowerCase();
        const company = placement.companies.find((item) => item.name.toLowerCase().includes(companyName));
        if (!company) return false;
        const rawStatus = String(cmd.payload?.status || 'preparing').toLowerCase().replace(/\s+/g, '_');
        const allowed: ApplicationStatus[] = ['not_started', 'preparing', 'applied', 'oa_scheduled', 'oa_completed', 'interview_scheduled', 'interview_completed', 'selected', 'rejected', 'on_hold'];
        const status = allowed.includes(rawStatus as ApplicationStatus) ? rawStatus as ApplicationStatus : 'preparing';
        savePlacementOS(updateApplicationStatus(placement, company.id, status));
        return true;
      }

      case 'addInterviewRound':
      case 'addOAResult':
        console.info('Placement mutation command recognized; UI confirmation should collect structured fields before execution.', cmd.payload);
        return true;

      default:
        console.warn('Unknown command type:', cmd.type);
        return false;
    }
  } catch (err) {
    console.error('Failed to execute command:', err);
    return false;
  }
}
