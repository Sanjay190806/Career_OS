import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const syncPostSchema = z.object({
  userId: z.string().min(1),
  data: z.record(z.any())
});

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function containsDangerousKeys(value: unknown, seen = new WeakSet<object>()): boolean {
  if (Array.isArray(value)) {
    if (seen.has(value)) return false;
    seen.add(value);
    return value.some((item) => containsDangerousKeys(item, seen));
  }

  if (!isPlainObject(value)) {
    return false;
  }

  if (seen.has(value)) return false;
  seen.add(value);

  return Object.keys(value).some((key) => (
    DANGEROUS_KEYS.has(key) || containsDangerousKeys(value[key], seen)
  ));
}

export async function handlePullSync(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.query.userId as string) || "local-user";
    
    const snapshot = await prisma.appSnapshot.findUnique({
      where: { userId }
    });

    if (!snapshot) {
      res.status(200).json({ data: null, message: "No snapshot backup found for this user." });
      return;
    }

    res.status(200).json({ data: snapshot.data, updatedAt: snapshot.updatedAt });
  } catch (error: any) {
    console.error("Pull sync error:", error);
    res.status(503).json({
      error: error?.message || "Failed to load database backup.",
      code: 'database_unavailable'
    });
  }
}

export async function handlePushSync(req: Request, res: Response): Promise<void> {
  try {
    if (containsDangerousKeys(req.body)) {
      res.status(400).json({ error: "Suspicious prototype pollution payload rejected." });
      return;
    }

    const parsed = syncPostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid backup JSON payload structure." });
      return;
    }

    const { userId, data } = parsed.data;

    // Create user if they don't exist
    await prisma.user.upsert({
      where: { email: `${userId}@sanzzdream.com` },
      update: {},
      create: {
        id: userId,
        name: 'Sanju',
        email: `${userId}@sanzzdream.com`,
        college: 'RMD Engineering College',
        roleGoal: 'SWE / AI Engineer'
      }
    });

    const result = await prisma.appSnapshot.upsert({
      where: { userId },
      update: {
        data: data as any
      },
      create: {
        userId,
        data: data as any
      }
    });

    res.status(200).json({ success: true, updatedAt: result.updatedAt });
  } catch (error: any) {
    console.error("Push sync error:", error);
    res.status(503).json({
      error: error?.message || "Failed to save snapshot to database.",
      code: 'database_unavailable'
    });
  }
}
