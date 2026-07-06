import Friendship from '../models/Friendship.js';
import User from '../models/User.js';
import { toFriendshipDto } from './format.js';

export async function sendFriendRequest(req, res, next) {
  try {
    const friendId = req.params.friendId;
    if (!friendId || friendId === req.user.id) {
      return res.status(400).json({ message: 'Invalid friend request target' });
    }

    const existing = await Friendship.findOne({ $or: [{ user: req.user.id, friend: friendId }, { user: friendId, friend: req.user.id }] });
    if (existing) {
      return res.status(409).json({ message: 'Friendship already exists or is pending' });
    }

    const pairKey = [req.user.id, friendId].sort().join(':');
    const friendship = await Friendship.create({ user: req.user.id, friend: friendId, status: 'PENDING', pairKey });
    const populated = await Friendship.findById(friendship._id).populate(['user', 'friend']);
    return res.status(201).json(toFriendshipDto(populated));
  } catch (error) {
    return next(error);
  }
}

export async function sendFriendRequestByCode(req, res, next) {
  try {
    const user = await User.findOne({ friendCode: req.params.friendCode });
    if (!user) {
      return res.status(404).json({ message: 'Friend code not found' });
    }
    req.params.friendId = user._id.toString();
    return sendFriendRequest(req, res, next);
  } catch (error) {
    return next(error);
  }
}

export async function acceptFriendRequest(req, res, next) {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);
    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendship.status = 'ACCEPTED';
    await friendship.save();
    return res.json({ message: 'Friend request accepted' });
  } catch (error) {
    return next(error);
  }
}

export async function rejectFriendRequest(req, res, next) {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);
    if (!friendship) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    friendship.status = 'REJECTED';
    await friendship.save();
    return res.json({ message: 'Friend request rejected' });
  } catch (error) {
    return next(error);
  }
}

export async function getFriends(req, res, next) {
  try {
    const friendships = await Friendship.find({ status: 'ACCEPTED', $or: [{ user: req.user.id }, { friend: req.user.id }] }).populate(['user', 'friend']).sort({ createdAt: -1 });
    return res.json(friendships.map(toFriendshipDto));
  } catch (error) {
    return next(error);
  }
}

export async function getPendingRequests(req, res, next) {
  try {
    const friendships = await Friendship.find({ status: 'PENDING', friend: req.user.id }).populate(['user', 'friend']).sort({ createdAt: -1 });
    return res.json(friendships.map(toFriendshipDto));
  } catch (error) {
    return next(error);
  }
}

export async function removeFriend(req, res, next) {
  try {
    await Friendship.findByIdAndDelete(req.params.friendshipId);
    return res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    return next(error);
  }
}