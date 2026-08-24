import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import clubRoutes from './clubs.js';
import eventRoutes from './events.js';
import teamRoutes from './teams.js';
import friendshipRoutes from './friends.js';
import journalRoutes from './journals.js';
import messagesRoutes from './messages.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clubs', clubRoutes);
router.use('/events', eventRoutes);
router.use('/teams', teamRoutes);
router.use('/friends', friendshipRoutes);
router.use('/journals', journalRoutes);
router.use('/messages', messagesRoutes);

export default router;