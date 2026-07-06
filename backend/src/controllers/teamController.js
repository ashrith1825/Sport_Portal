import Team from '../models/Team.js';
import Club from '../models/Club.js';
import User from '../models/User.js';
import { toTeamDto } from './format.js';

async function enrichTeam(team) {
  if (!team) return null;
  return team.populate(['club', 'captain', 'members']);
}

export async function getTeamsByClub(req, res, next) {
  try {
    const teams = await Team.find({ club: req.params.clubId }).sort({ createdAt: -1 }).populate(['club', 'captain', 'members']);
    return res.json(teams.map((team) => toTeamDto(team)));
  } catch (error) {
    return next(error);
  }
}

export async function getTeamById(req, res, next) {
  try {
    const team = await Team.findById(req.params.id).populate(['club', 'captain', 'members']);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    return res.json(toTeamDto(team));
  } catch (error) {
    return next(error);
  }
}

export async function createTeam(req, res, next) {
  try {
    const { clubId, name, description = null, captainId = req.user.id } = req.body;
    if (!clubId || !name) {
      return res.status(400).json({ message: 'clubId and name are required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the club owner can create teams' });
    }

    const team = await Team.create({ name, description, club: clubId, captain: captainId, members: [captainId] });
    await Club.findByIdAndUpdate(clubId, { $addToSet: { teams: team._id } });
    await User.findByIdAndUpdate(captainId, { $addToSet: { joinedTeams: team._id } });
    return res.status(201).json(toTeamDto(await enrichTeam(await Team.findById(team._id).populate(['club', 'captain', 'members']))));
  } catch (error) {
    return next(error);
  }
}

export async function addTeamMember(req, res, next) {
  try {
    await Team.findByIdAndUpdate(req.params.teamId, { $addToSet: { members: req.params.userId } });
    await User.findByIdAndUpdate(req.params.userId, { $addToSet: { joinedTeams: req.params.teamId } });
    return res.json({ message: 'Team member added successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function removeTeamMember(req, res, next) {
  try {
    await Team.findByIdAndUpdate(req.params.teamId, { $pull: { members: req.params.userId } });
    await User.findByIdAndUpdate(req.params.userId, { $pull: { joinedTeams: req.params.teamId } });
    return res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTeam(req, res, next) {
  try {
    await Team.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    return next(error);
  }
}