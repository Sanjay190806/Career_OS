import { logMigration } from '../../utils/stateMigrationUtils';

export function runMigrationForStore(storeName: string, state: any, version: number | undefined): any {
  try {
    let migrated = { ...state };
    let success = true;
    let notes = '';

    if (storeName === 'sanju-career-os-ui-state') {
      migrated = {
        shaylaChatHeight: 600,
        shaylaRightPanelWidth: 360,
        shaylaRightPanelCollapsed: false,
        shaylaAgentNotificationsCollapsed: false,
        shaylaQuickActionsCollapsed: false,
        ...migrated
      };
      notes = 'Merged Shayla layout defaults';
    } else if (storeName === 'sanju-ai-settings-persist-v3') {
      migrated = {
        activeProvider: 'groq',
        activeModel: 'openai/gpt-oss-20b',
        activeMode: 'Daily Coach',
        fallbackProvider: 'groq',
        fallbackModel: 'llama-3.1-8b-instant',
        streamingEnabled: true,
        temperature: 0.7,
        topP: 0.9,
        maxTokens: 1200,
        contextWindowMode: 'full',
        ...migrated
      };
      notes = 'Merged AI settings defaults';
    } else if (storeName === 'sanju-shayla-agent-persist-v1') {
      migrated = {
        agentModeEnabled: true,
        dailyBriefingEnabled: true,
        eveningReviewEnabled: true,
        smartNotificationsEnabled: true,
        autoGenerateBriefingOnLaunch: false,
        notificationSensitivity: 'medium',
        enableRecoverySuggestions: true,
        enableGermanNudges: true,
        enableCsCoreNudges: true,
        enableResumeNudges: true,
        dismissedNotifications: [],
        briefingHistory: [],
        eveningReviewHistory: [],
        smartNotificationLog: [],
        ...migrated
      };
      notes = 'Merged agent settings defaults';
    } else if (storeName === 'sanju-career-os-persist') {
      migrated = {
        companyTargets: [],
        skillTree: {},
        weeklyReviews: {},
        weeklyFreezeUsage: {},
        chatHistory: [],
        dailyLogs: {},
        problemLogs: {},
        xp: 0,
        level: 1,
        badges: [],
        unlockedBadges: {},
        sqlProgress: {},
        aptitudeProgress: {},
        csCoreProgress: {},
        skillRackStats: { totalSolved: 0, easyCount: 0, mediumCount: 0, hardCount: 0, categories: {} },
        dsaPatternMastery: {},
        ...migrated
      };
      notes = 'Merged placement execution targets defaults';
    } else {
      notes = 'No migration schema changes required';
    }

    logMigration({
      storeName,
      version: version ?? 'legacy',
      migratedAt: new Date().toISOString(),
      success,
      notes
    });

    return migrated;
  } catch (error: any) {
    logMigration({
      storeName,
      version: version ?? 'legacy',
      migratedAt: new Date().toISOString(),
      success: false,
      notes: `Error: ${error.message || error}`
    });
    return state;
  }
}
export default runMigrationForStore;
