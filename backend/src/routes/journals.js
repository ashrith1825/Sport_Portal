import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createJournal, deleteJournal, getJournalById, getJournals, getJournalsBySport, getMyJournals, searchJournals, updateJournal } from '../controllers/journalController.js';

const router = Router();

router.get('/', getJournals);
router.get('/sport/:sportType', getJournalsBySport);
router.get('/search', searchJournals);
router.get('/my', requireAuth, getMyJournals);
router.get('/:id', getJournalById);
router.post('/', requireAuth, createJournal);
router.put('/:id', requireAuth, updateJournal);
router.delete('/:id', requireAuth, deleteJournal);

export default router;