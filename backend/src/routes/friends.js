import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { acceptFriendRequest, getFriends, getPendingRequests, rejectFriendRequest, removeFriend, sendFriendRequest, sendFriendRequestByCode } from '../controllers/friendshipController.js';

const router = Router();

router.post('/request/:friendId', requireAuth, sendFriendRequest);
router.post('/request/code/:friendCode', requireAuth, sendFriendRequestByCode);
router.put('/accept/:friendshipId', requireAuth, acceptFriendRequest);
router.put('/reject/:friendshipId', requireAuth, rejectFriendRequest);
router.get('/', requireAuth, getFriends);
router.get('/pending', requireAuth, getPendingRequests);
router.delete('/:friendshipId', requireAuth, removeFriend);

export default router;