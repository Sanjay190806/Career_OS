import { useCareerStore } from '../app/store/useCareerStore';
import { ParsedCommand } from './commandParser';

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

      default:
        console.warn('Unknown command type:', cmd.type);
        return false;
    }
  } catch (err) {
    console.error('Failed to execute command:', err);
    return false;
  }
}
