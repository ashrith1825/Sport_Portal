import Club from '../models/Club.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import { toClubDto } from './format.js';

const SUPPORTED_SPORT_ICONS = new Set([
  'soccer', 'basketball', 'volleyball', 'tennis', 'badminton', 'baseball', 'cricket', 'rugby',
  'golf', 'swimming', 'running', 'cycling', 'hockey', 'boxing', 'american-football', 'skiing', 'other',
]);

async function removeMemberFromClub(club, userId) {
  const teams = await Team.find({ club: club._id }).select('_id').lean();
  const teamIds = teams.map((team) => team._id);

  await Club.findByIdAndUpdate(club._id, { $pull: { members: userId } });
  await Team.updateMany(
    { club: club._id, captain: userId },
    { $set: { captain: null }, $pull: { members: userId } }
  );
  await Team.updateMany(
    { club: club._id, captain: { $ne: userId } },
    { $pull: { members: userId } }
  );
  await User.findByIdAndUpdate(userId, {
    $pull: { joinedClubs: club._id, joinedTeams: { $in: teamIds } },
  });
}

async function enrichClub(club) {
  if (!club) return null;
  const populated = await club.populate('owner', 'username');
  const teamCount = await Team.countDocuments({ club: club._id });
  const fullClub = populated.toObject();
  fullClub.teamCount = teamCount;
  fullClub.memberCount = fullClub.members?.length || 0;
  return fullClub;
}

export async function getClubs(req, res, next) {
  try {
    const clubs = await Club.find().sort({ createdAt: -1 }).populate('owner', 'username');
    const mapped = await Promise.all(clubs.map(async (club) => toClubDto(await enrichClub(club))));
    return res.json(mapped);
  } catch (error) {
    return next(error);
  }
}

export async function getClubById(req, res, next) {
  try {
    const club = await Club.findById(req.params.id)
      .populate('owner', 'username')
      .populate('members', 'username firstName lastName');
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    return res.json(toClubDto(await enrichClub(club)));
  } catch (error) {
    return next(error);
  }
}

export async function getClubsBySport(req, res, next) {
  try {
    const clubs = await Club.find({ sportType: req.params.sportType }).sort({ createdAt: -1 }).populate('owner', 'username');
    const mapped = await Promise.all(clubs.map(async (club) => toClubDto(await enrichClub(club))));
    return res.json(mapped);
  } catch (error) {
    return next(error);
  }
}

export async function searchClubs(req, res, next) {
  try {
    const regex = new RegExp(req.query.keyword || '', 'i');
    const clubs = await Club.find({ $or: [{ name: regex }, { description: regex }, { sportType: regex }] }).sort({ createdAt: -1 }).populate('owner', 'username');
    const mapped = await Promise.all(clubs.map(async (club) => toClubDto(await enrichClub(club))));
    return res.json(mapped);
  } catch (error) {
    return next(error);
  }
}

export async function getMyClubs(req, res, next) {
  try {
    const clubs = await Club.find({ $or: [{ owner: req.user.id }, { members: req.user.id }] }).sort({ createdAt: -1 }).populate('owner', 'username');
    const mapped = await Promise.all(clubs.map(async (club) => toClubDto(await enrichClub(club))));
    return res.json(mapped);
  } catch (error) {
    return next(error);
  }
}

export async function createClub(req, res, next) {
  try {
    const { name, description = null, sportType, sportIcon = 'soccer' } = req.body;
    if (!name || !sportType) {
      return res.status(400).json({ message: 'Name and sportType are required' });
    }
    if (!SUPPORTED_SPORT_ICONS.has(sportIcon)) {
      return res.status(400).json({ message: 'Choose a supported sport icon' });
    }

    const existingOwnerClub = await Club.findOne({ owner: req.user.id }).lean();
    if (existingOwnerClub) {
      return res.status(400).json({ message: 'You already own a club in this phase. One club admin slot is allowed.' });
    }

    const club = await Club.create({ name, description, sportType, sportIcon, owner: req.user.id, members: [req.user.id] });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedClubs: club._id } });
    const populated = await Club.findById(club._id).populate('owner', 'username');
    return res.status(201).json(toClubDto(await enrichClub(populated)));
  } catch (error) {
    return next(error);
  }
}

export async function updateClub(req, res, next) {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can update this club' });
    }

    const updates = {};
    for (const key of ['name', 'description', 'sportType', 'sportIcon']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.sportIcon !== undefined && !SUPPORTED_SPORT_ICONS.has(updates.sportIcon)) {
      return res.status(400).json({ message: 'Choose a supported sport icon' });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No club fields were provided' });
    }

    await Club.findByIdAndUpdate(req.params.id, updates);
    const populated = await Club.findById(req.params.id).populate('owner', 'username');
    return res.json(toClubDto(await enrichClub(populated)));
  } catch (error) {
    return next(error);
  }
}

export async function deleteClub(req, res, next) {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can delete this club' });
    }

    await User.updateMany({ joinedClubs: club._id }, { $pull: { joinedClubs: club._id } });
    await Team.deleteMany({ club: club._id });
    await Club.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function joinClub(req, res, next) {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    await Club.findByIdAndUpdate(club._id, { $addToSet: { members: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedClubs: club._id } });
    return res.json({ message: 'You joined the club successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function leaveClub(req, res, next) {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'Owner cannot leave their own club' });
    }

    await removeMemberFromClub(club, req.user.id);
    return res.json({ message: 'You left the club successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function removeClubMember(req, res, next) {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }
    if (club.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the club admin can remove club members' });
    }
    if (club.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'The club admin cannot be removed' });
    }
    const isMember = club.members.some((memberId) => memberId.toString() === req.params.userId);
    if (!isMember) return res.status(404).json({ message: 'User is not a member of this club' });

    await removeMemberFromClub(club, req.params.userId);
    return res.json({ message: 'Club member removed successfully' });
  } catch (error) {
    return next(error);
  }
}