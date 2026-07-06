import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createEvent, deleteEvent, getEventById, getEvents, getEventsBySport, getMyEvents, getUpcomingEvents, joinEvent, leaveEvent, searchEvents, updateEvent } from '../controllers/eventController.js';

const router = Router();

router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/sport/:sportType', getEventsBySport);
router.get('/search', searchEvents);
router.get('/my', requireAuth, getMyEvents);
router.get('/:id', getEventById);
router.post('/', requireAuth, createEvent);
router.put('/:id', requireAuth, updateEvent);
router.delete('/:id', requireAuth, deleteEvent);
router.post('/:id/join', requireAuth, joinEvent);
router.post('/:id/leave', requireAuth, leaveEvent);

export default router;