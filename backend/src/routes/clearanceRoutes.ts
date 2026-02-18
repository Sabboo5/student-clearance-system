import { Router } from 'express';
import {
  createClearanceRequest,
  getClearanceRequests,
  getClearanceRequestById,
  reviewDepartmentClearance,
  uploadDocument,
} from '../controllers/clearanceController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import upload from '../middleware/upload';

const router = Router();

router.use(protect);

router.post('/', restrictTo('student'), createClearanceRequest);
router.get('/', getClearanceRequests);
router.get('/:id', getClearanceRequestById);
router.put('/:id/review', restrictTo('officer', 'admin'), reviewDepartmentClearance);
router.post('/:id/upload', upload.single('document'), uploadDocument);

export default router;
