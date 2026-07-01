import { prisma } from '../lib/prisma.js';
import { classifyDatabaseError, DatabaseErrorInfo, getSafeDatabaseConfig } from '../utils/databaseError.js';

export async function checkDatabaseHealth(): Promise<DatabaseErrorInfo> {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    return {
      available: true,
      code: 'ok',
      message: 'Database connection is healthy.',
      safeConfig: getSafeDatabaseConfig(),
    };
  } catch (error) {
    return classifyDatabaseError(error);
  }
}
