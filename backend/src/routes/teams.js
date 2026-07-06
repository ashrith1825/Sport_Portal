import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addTeamMember, createTeam, deleteTeam, getTeamById, getTeamsByClub, removeTeamMember } from '../controllers/teamController.js';

const router = Router();

router.get('/club/:clubId', getTeamsByClub);
router.get('/:id', getTeamById);
router.post('/', requireAuth, createTeam);
router.post('/:teamId/members/:userId', requireAuth, addTeamMember);
router.delete('/:teamId/members/:userId', requireAuth, removeTeamMember);
router.delete('/:id', requireAuth, deleteTeam);

export default router;