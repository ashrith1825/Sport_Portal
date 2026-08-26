import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getClubMessages, postClubMessage, getDirectMessages, postDirectMessage, deleteClubMessage, deleteDirectMessage } from '../controllers/messagesController.js';

const router = Router();

// Club messages
router.get('/clubs/:id', getClubMessages);
router.post('/clubs/:id', requireAuth, postClubMessage);
router.delete('/clubs/:messageId', requireAuth, deleteClubMessage);

// Direct messages (friend chats)
router.get('/direct/:friendId', requireAuth, getDirectMessages);
router.post('/direct/:friendId', requireAuth, postDirectMessage);
router.delete('/direct/:messageId', requireAuth, deleteDirectMessage);

export default router;
