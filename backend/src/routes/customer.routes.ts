import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', requireRole(UserRole.ADMIN, UserRole.SALES), customerController.createCustomer);
router.get('/', requireRole(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), customerController.getCustomers);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), customerController.getCustomerById);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.SALES), customerController.updateCustomer);
router.delete('/:id', requireRole(UserRole.ADMIN), customerController.deleteCustomer);
router.post('/:id/follow-ups', requireRole(UserRole.ADMIN, UserRole.SALES), customerController.addFollowUp);
router.get('/:id/follow-ups', requireRole(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), customerController.getFollowUps);

export default router;
