import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import * as stockMovementController from '../controllers/stockMovement.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Products
router.post('/', requireRole(UserRole.ADMIN, UserRole.WAREHOUSE), productController.createProduct);
router.get('/', requireRole(UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.SALES, UserRole.ACCOUNTS), productController.getProducts);
router.get('/:id', requireRole(UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.SALES, UserRole.ACCOUNTS), productController.getProductById);
router.put('/:id', requireRole(UserRole.ADMIN, UserRole.WAREHOUSE), productController.updateProduct);
router.delete('/:id', requireRole(UserRole.ADMIN), productController.deleteProduct);

// Product Stock Movements
router.post('/:id/stock-movements', requireRole(UserRole.ADMIN, UserRole.WAREHOUSE), stockMovementController.createStockMovement);
router.get('/:id/stock-movements', requireRole(UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.SALES, UserRole.ACCOUNTS), stockMovementController.getProductStockMovements);

export default router;
