import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  addTeamMember,
  approveTeamRequest,
  createTeam,
  deleteTeam,
  getTeamById,
  getTeamRequests,
  getTeamsByClub,
  removeTeamMember,
  requestTeamDeletion,
  requestTeamJoin,
  requestTeamLeave,
  transferTeamLeadership,
} from '../controllers/teamController.js';

const router = Router();

router.get('/club/:clubId', getTeamsByClub);
router.get('/:id', getTeamById);
router.get('/:id/requests', requireAuth, getTeamRequests);
router.post('/', requireAuth, createTeam);
router.post('/requests/join', requireAuth, requestTeamJoin);
router.post('/requests/leave', requireAuth, requestTeamLeave);
router.post('/requests/delete', requireAuth, requestTeamDeletion);
router.post('/requests/:requestId/decision', requireAuth, approveTeamRequest);
router.post('/:teamId/members/:userId', requireAuth, addTeamMember);
router.post('/:teamId/transfer/:newCaptainId', requireAuth, transferTeamLeadership);
router.delete('/:teamId/members/:userId', requireAuth, removeTeamMember);
router.delete('/:id', requireAuth, deleteTeam);

export default router;