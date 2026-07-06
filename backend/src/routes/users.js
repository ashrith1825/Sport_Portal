import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAllUsers, getCurrentUser, getUserByCode, getUserById, updateCurrentUser } from '../controllers/userController.js';

const router = Router();

router.get('/me', requireAuth, getCurrentUser);
router.put('/me', requireAuth, updateCurrentUser);
router.get('/code/:friendCode', getUserByCode);
router.get('/:id', getUserById);
router.get('/', getAllUsers);

export default router;