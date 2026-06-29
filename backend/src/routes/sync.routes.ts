import { Router } from 'express';
import { handlePullSync, handlePushSync } from '../controllers/sync.controller.js';

const router = Router();

router.get('/sync', handlePullSync);
router.post('/sync', handlePushSync);

export default router;
