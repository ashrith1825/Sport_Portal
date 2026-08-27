import Club from '../models/Club.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import ClubRequest from '../models/ClubRequest.js';
import { toClubDto } from './format.js';

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
    const club = await Club.findById(req.params.id).populate('owner', 'username');
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
    const { name, description = null, sportType, logoUrl = null } = req.body;
    if (!name || !sportType) {
      return res.status(400).json({ message: 'Name and sportType are required' });
    }

    const existingOwnerClub = await Club.findOne({ owner: req.user.id }).lean();
    if (existingOwnerClub) {
      return res.status(400).json({ message: 'You already own a club in this phase. One club admin slot is allowed.' });
    }

    const club = await Club.create({ name, description, sportType, logoUrl, owner: req.user.id, members: [req.user.id] });
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
    for (const key of ['name', 'description', 'sportType', 'logoUrl']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
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

    const alreadyMember = (club.members || []).some((memberId) => memberId.toString() === req.user.id);
    if (alreadyMember) {
      return res.status(409).json({ message: 'You are already a member of this club' });
    }

    const existingPending = await ClubRequest.findOne({ type: 'CLUB_JOIN', club: club._id, requestedBy: req.user.id, status: 'PENDING' }).lean();
    if (existingPending) {
      return res.status(409).json({ message: 'A club join request is already pending' });
    }

    const request = await ClubRequest.create({
      type: 'CLUB_JOIN',
      club: club._id,
      user: req.user.id,
      requestedBy: req.user.id,
      message: 'Requested club membership',
      status: 'PENDING',
    });

    return res.status(202).json({ message: 'Club join request sent', requestId: request._id });
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

    await Club.findByIdAndUpdate(club._id, { $pull: { members: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $pull: { joinedClubs: club._id } });
    await ClubRequest.deleteMany({ club: club._id, user: req.user.id, type: { $in: ['CLUB_JOIN', 'TEAM_LEAVE'] }, status: 'PENDING' });

    return res.json({ message: 'You left the club successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function getClubRequests(req, res, next) {
  try {
    const club = await Club.findById(req.params.id).select('owner').lean();
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (club.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the club admin can view these requests' });
    }

    const requests = await ClubRequest.find({ club: req.params.id, status: 'PENDING' })
      .sort({ createdAt: -1 })
      .populate('user', 'username firstName lastName')
      .populate('team', 'name')
      .lean();

    return res.json(requests);
  } catch (error) {
    return next(error);
  }
}

export async function decisionClubRequest(req, res, next) {
  try {
    const { requestId } = req.params;
    const { decision } = req.body;
    const request = await ClubRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const club = await Club.findById(request.club);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the club admin can review this request' });
    }

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ message: 'decision must be APPROVED or REJECTED' });
    }

    request.status = decision;
    request.reviewedBy = req.user.id;
    await request.save();

    if (decision === 'APPROVED') {
      if (request.type === 'CLUB_JOIN') {
        await Club.findByIdAndUpdate(request.club, { $addToSet: { members: request.user } });
        await User.findByIdAndUpdate(request.user, { $addToSet: { joinedClubs: request.club } });
      }

      if (request.type === 'TEAM_CREATE') {
        const team = await Team.create({
          name: request.name || 'New Team',
          description: request.description || '',
          club: request.club,
          captain: request.user,
          members: [request.user],
        });
        await Club.findByIdAndUpdate(request.club, { $addToSet: { teams: team._id } });
        await User.findByIdAndUpdate(request.user, { $addToSet: { joinedTeams: team._id } });
      }
    }

    return res.json({ message: `Request ${decision.toLowerCase()}` });
  } catch (error) {
    return next(error);
  }
}