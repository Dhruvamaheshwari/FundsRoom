import { Router } from 'express';
import * as stockMovementController from '../controllers/stockMovement.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', requireRole(UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.SALES, UserRole.ACCOUNTS), stockMovementController.getAllStockMovements);

export default router;
