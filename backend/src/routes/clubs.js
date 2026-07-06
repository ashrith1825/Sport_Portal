import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createClub, deleteClub, getClubById, getClubs, getClubsBySport, getMyClubs, joinClub, leaveClub, searchClubs, updateClub } from '../controllers/clubController.js';

const router = Router();

router.get('/', getClubs);
router.get('/sport/:sportType', getClubsBySport);
router.get('/search', searchClubs);
router.get('/my', requireAuth, getMyClubs);
router.get('/:id', getClubById);
router.post('/', requireAuth, createClub);
router.put('/:id', requireAuth, updateClub);
router.delete('/:id', requireAuth, deleteClub);
router.post('/:id/join', requireAuth, joinClub);
router.post('/:id/leave', requireAuth, leaveClub);

export default router;