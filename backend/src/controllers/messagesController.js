import Club from '../models/Club.js';
import ClubMessage from '../models/ClubMessage.js';
import DirectMessage from '../models/DirectMessage.js';
import Friendship from '../models/Friendship.js';
import User from '../models/User.js';

export async function getClubMessages(req, res, next) {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    const messages = await ClubMessage.find({ club: id, removed: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('from', 'username firstName lastName avatarUrl')
      .lean();

    return res.json(messages.reverse());
  } catch (error) {
    return next(error);
  }
}

export async function postClubMessage(req, res, next) {
  try {
    const { id } = req.params; // club id
    const { text } = req.body;
    const userId = req.user?.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const club = await Club.findById(id).lean();
    if (!club) return res.status(404).json({ message: 'Club not found' });

    // check membership
    const isMember = (club.members || []).some((m) => m.toString() === userId) || (club.owner && club.owner.toString() === userId);
    if (!isMember) return res.status(403).json({ message: 'Only club members can post messages' });

    const msg = await ClubMessage.create({ club: id, from: userId, text: text.trim() });
    await msg.populate('from', 'username firstName lastName avatarUrl');
    return res.status(201).json(msg);
  } catch (error) {
    return next(error);
  }
}

export async function getDirectMessages(req, res, next) {
  try {
    const otherId = req.params.friendId;
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);

    // verify friendship exists and is accepted
    const accepted = await Friendship.findOne({
      $or: [
        { user: userId, friend: otherId, status: 'ACCEPTED' },
        { user: otherId, friend: userId, status: 'ACCEPTED' },
      ],
    }).lean();
    if (!accepted) return res.status(403).json({ message: 'You are not friends with this user' });

    const messages = await DirectMessage.find({
      $or: [
        { from: userId, to: otherId },
        { from: otherId, to: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('from to', 'username firstName lastName avatarUrl')
      .lean();

    return res.json(messages.reverse());
  } catch (error) {
    return next(error);
  }
}

export async function postDirectMessage(req, res, next) {
  try {
    const otherId = req.params.friendId;
    const userId = req.user?.id;
    const { text } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required' });

    // verify friendship exists and is accepted
    const accepted = await Friendship.findOne({
      $or: [
        { user: userId, friend: otherId, status: 'ACCEPTED' },
        { user: otherId, friend: userId, status: 'ACCEPTED' },
      ],
    }).lean();
    if (!accepted) return res.status(403).json({ message: 'You are not friends with this user' });

    const dm = await DirectMessage.create({ from: userId, to: otherId, text: text.trim() });
    await dm.populate('from to', 'username firstName lastName avatarUrl');
    return res.status(201).json(dm);
  } catch (error) {
    return next(error);
  }
}

export async function deleteClubMessage(req, res, next) {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    const msg = await ClubMessage.findById(messageId).lean();
    if (!msg) return res.status(404).json({ message: 'Message not found' });

    const club = await Club.findById(msg.club).lean();
    if (!club) return res.status(404).json({ message: 'Club not found' });

    // allow deletion by message author or club owner
    const isOwner = club.owner && club.owner.toString() === userId;
    const isAuthor = msg.from && msg.from.toString() === userId;
    if (!isOwner && !isAuthor) return res.status(403).json({ message: 'Not authorized to delete this message' });

    await ClubMessage.findByIdAndUpdate(messageId, { removed: true });
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

export async function deleteDirectMessage(req, res, next) {
  try {
    const message = await DirectMessage.findById(req.params.messageId).lean();
    if (!message) return res.status(404).json({ message: 'Message not found' });
    if (message.from.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    await DirectMessage.findByIdAndDelete(req.params.messageId);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}
