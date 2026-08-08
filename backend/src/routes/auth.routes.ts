import { Router } from 'express';
import { login, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, me);

// Test route for role middleware
router.get('/admin-only', authenticate, requireRole('ADMIN'), (req, res) => {
  res.json({ message: 'You have admin access' });
});

export default router;
