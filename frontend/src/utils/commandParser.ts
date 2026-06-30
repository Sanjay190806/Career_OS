export interface ParsedCommand {
  type:
    | 'completeDailyTask'
    | 'updateGermanProgress'
    | 'addWeakWord'
    | 'addApplication'
    | 'markCSCoreTopic'
    | 'updateProjectProgress'
    | 'generateTodayPlan'
    | 'completeSmartTask'
    | 'refreshAIBrain'
    | 'showPlacementReadiness'
    | 'updateCompanyStatus'
    | 'addInterviewRound'
    | 'addOAResult'
    | 'recommendNextAction';
  payload: any;
  summary: string;
}

export function parseCommandOffline(text: string): ParsedCommand | null {
  const t = text.toLowerCase().trim();

  if ((t.includes('generate') || t.includes('create')) && t.includes('plan') && (t.includes('today') || t.includes('daily'))) {
    return {
      type: 'generateTodayPlan',
      payload: { mode: t.includes('busy') ? 'busy' : t.includes('low energy') ? 'low_energy' : t.includes('sprint') ? 'placement_sprint' : 'normal' },
      summary: 'Generate a smart plan for today. This creates a preview and should be saved only after confirmation.'
    };
  }

  if (t.includes('completed') && (t.includes('sql task') || t.includes('dsa task') || t.includes('planner task') || t.includes('smart task'))) {
    const category = t.includes('sql') ? 'sql' : t.includes('dsa') ? 'coding' : undefined;
    return {
      type: 'completeSmartTask',
      payload: { category },
      summary: category ? `Mark today's ${category} smart task as complete after confirmation.` : 'Mark a matching smart task as complete after confirmation.'
    };
  }

  if ((t.includes('refresh') || t.includes('update')) && (t.includes('ai brain') || t.includes('career brain'))) {
    return {
      type: 'refreshAIBrain',
      payload: {},
      summary: 'Refresh AI Brain career summary.'
    };
  }

  if (t.includes('placement readiness') || t.includes('show readiness')) {
    return {
      type: 'showPlacementReadiness',
      payload: {},
      summary: 'Show placement readiness summary.'
    };
  }

  if (t.includes('next action') || t.includes('recommend')) {
    return {
      type: 'recommendNextAction',
      payload: {},
      summary: 'Recommend the next best career action.'
    };
  }

  if ((t.includes('update') || t.includes('mark')) && t.includes('company') && t.includes('status')) {
    const companyMatch = text.match(/company\s+([a-zA-Z0-9\s]+?)\s+status/i);
    const statusMatch = text.match(/status\s+([a-zA-Z_ ]+)/i);
    return {
      type: 'updateCompanyStatus',
      payload: { company: companyMatch?.[1]?.trim(), status: statusMatch?.[1]?.trim() },
      summary: `Update company status${companyMatch?.[1] ? ` for ${companyMatch[1].trim()}` : ''} after confirmation.`
    };
  }

  if (t.includes('interview') && (t.includes('add') || t.includes('round'))) {
    return {
      type: 'addInterviewRound',
      payload: { raw: text },
      summary: 'Add an interview round after confirmation.'
    };
  }

  if ((t.includes('oa') || t.includes('online assessment')) && (t.includes('add') || t.includes('score') || t.includes('result'))) {
    return {
      type: 'addOAResult',
      payload: { raw: text },
      summary: 'Add an OA result after confirmation.'
    };
  }

  // 1. Add Application
  // e.g., "add application Google for Software Engineer status Applied"
  // or "add company Apple"
  if (t.includes('add application') || t.includes('add company')) {
    const companyMatch = text.match(/(?:company|application)\s+([a-zA-Z0-9\s]+?)(?:\s+for|\s+status|\s+role|$)/i);
    const roleMatch = text.match(/for\s+([a-zA-Z0-9\s]+?)(?:\s+status|$)/i);
    const statusMatch = text.match(/status\s+([a-zA-Z0-9\s]+)/i);

    const company = companyMatch ? companyMatch[1].trim() : 'Unknown Company';
    const role = roleMatch ? roleMatch[1].trim() : 'Software Engineer';
    const status = statusMatch ? statusMatch[1].trim() : 'Applied';

    return {
      type: 'addApplication',
      payload: { company, role, status },
      summary: `Add application: "${company}" for "${role}" (Status: ${status})`
    };
  }

  // 2. German study log
  // e.g. "log 15 minutes of German" or "german 20 min"
  if (t.includes('german') && (t.includes('log') || t.includes('minute') || t.includes('min'))) {
    const minsMatch = t.match(/(\d+)\s*(?:minute|min)/);
    const minutes = minsMatch ? parseInt(minsMatch[1], 10) : 15;
    return {
      type: 'updateGermanProgress',
      payload: { minutes },
      summary: `Log ${minutes} minutes of German study progress.`
    };
  }

  // 3. Mark CS Core topic completed
  // e.g. "mark cs core deadlocks in os as done"
  if (t.includes('cs core') || t.includes('cscore')) {
    const topicMatch = text.match(/(?:core|cscore)\s+([a-zA-Z0-9\s]+?)\s+in\s+([a-zA-Z0-9\s]+?)(?:\s+as|$)/i);
    if (topicMatch) {
      return {
        type: 'markCSCoreTopic',
        payload: { topic: topicMatch[1].trim(), subject: topicMatch[2].trim() },
        summary: `Mark CS Core topic "${topicMatch[1].trim()}" in "${topicMatch[2].trim()}" as completed.`
      };
    }
  }

  // 4. Mark task as done
  // e.g. "complete daily task solve two sum"
  if (t.includes('complete') || t.includes('mark task') || t.includes('finish task')) {
    const taskName = text.replace(/complete|daily task|mark task|as done|finish/gi, '').trim();
    if (taskName) {
      return {
        type: 'completeDailyTask',
        payload: { task: taskName },
        summary: `Mark task "${taskName}" as completed.`
      };
    }
  }

  return null;
}
