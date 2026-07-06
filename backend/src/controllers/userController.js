import User from '../models/User.js';
import { toUserDto } from './format.js';

export async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(toUserDto(user));
  } catch (error) {
    return next(error);
  }
}

export async function updateCurrentUser(req, res, next) {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatarUrl', 'bio'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No profile fields were provided' });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    return res.json(toUserDto(user));
  } catch (error) {
    return next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(toUserDto(user));
  } catch (error) {
    return next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users.map(toUserDto));
  } catch (error) {
    return next(error);
  }
}

export async function getUserByCode(req, res, next) {
  try {
    const user = await User.findOne({ friendCode: req.params.friendCode });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(toUserDto(user));
  } catch (error) {
    return next(error);
  }
}