import { Router } from 'express';
import * as challanController from '../controllers/challan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Create Draft Challan
router.post('/', requireRole(UserRole.ADMIN, UserRole.SALES), challanController.createChallan);

// Get all Challans
router.get('/', requireRole(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), challanController.getChallans);

// Get Challan by ID
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), challanController.getChallanById);

// Confirm Challan
router.post('/:id/confirm', requireRole(UserRole.ADMIN, UserRole.SALES), challanController.confirmChallan);

// Cancel Challan
router.post('/:id/cancel', requireRole(UserRole.ADMIN, UserRole.SALES), challanController.cancelChallan);

export default router;
