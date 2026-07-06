import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import clubRoutes from './clubs.js';
import eventRoutes from './events.js';
import teamRoutes from './teams.js';
import friendshipRoutes from './friends.js';
import journalRoutes from './journals.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clubs', clubRoutes);
router.use('/events', eventRoutes);
router.use('/teams', teamRoutes);
router.use('/friends', friendshipRoutes);
router.use('/journals', journalRoutes);

export default router;