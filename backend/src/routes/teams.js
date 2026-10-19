import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createTeam,
  deleteTeam,
  getTeamById,
  getTeamsByClub,
  joinTeam,
  leaveTeam,
  removeTeamMember,
  transferTeamLeadership,
} from '../controllers/teamController.js';

const router = Router();

router.get('/club/:clubId', getTeamsByClub);
router.get('/:id', getTeamById);
router.post('/', requireAuth, createTeam);
router.post('/:teamId/join', requireAuth, joinTeam);
router.post('/:teamId/leave', requireAuth, leaveTeam);
router.post('/:teamId/transfer/:newCaptainId', requireAuth, transferTeamLeadership);
router.delete('/:teamId/members/:userId', requireAuth, removeTeamMember);
router.delete('/:id', requireAuth, deleteTeam);

export default router;