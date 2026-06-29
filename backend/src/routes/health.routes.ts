import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const timestamp = new Date().toISOString();

  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.status(200).json({
      api: { status: 'ok' },
      database: { status: 'connected' },
      groq: { status: env.GROQ_API_KEY?.trim() ? 'configured' : 'missing', model: env.GROQ_MODEL || 'llama-3.1-8b-instant' },
      environment: env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp
    });
  } catch (error) {
    console.error('Health check database probe failed:', error);
    res.status(200).json({
      api: { status: 'ok' },
      database: { status: 'unavailable' },
      groq: { status: env.GROQ_API_KEY?.trim() ? 'configured' : 'missing', model: env.GROQ_MODEL || 'llama-3.1-8b-instant' },
      environment: env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp
    });
  }
});

export default router;
