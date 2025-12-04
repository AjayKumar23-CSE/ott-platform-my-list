import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/verify-token', AuthController.verifyToken);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/users', authenticateToken, AuthController.getAllUsers);

export default router;
