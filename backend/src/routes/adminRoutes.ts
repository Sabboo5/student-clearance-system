import { Router } from 'express';
import {
  getUsers,
  updateUser,
  deleteUser,
  getAnalytics,
  getAuditLogs,
  generateReport,
} from '../controllers/adminController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);
router.get('/reports', generateReport);

export default router;
