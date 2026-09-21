import express from 'express';
import getAdminDashboard from '../controllers/adminAnalyticsController.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/dashboard', authenticate, authorize('admin'), getAdminDashboard);

export default router;