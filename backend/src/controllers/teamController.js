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
    const { clubId, name, description = '' } = req.body;
    if (!clubId || !name) {
      return res.status(400).json({ message: 'clubId and name are required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const team = await Team.create({
      name,
      description,
      club: club._id,
      captain: req.user.id,
      members: [req.user.id],
    });
    await Club.findByIdAndUpdate(club._id, { $addToSet: { teams: team._id, members: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { joinedClubs: club._id, joinedTeams: team._id },
    });

    const populatedTeam = await Team.findById(team._id).populate(['club', 'captain', 'members']);
    return res.status(201).json(toTeamDto(populatedTeam));
  } catch (error) {
    return next(error);
  }
}

export async function joinTeam(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const club = await Club.findById(team.club);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    const isMember = (team.members || []).some((memberId) => memberId.toString() === req.user.id);
    if (isMember) return res.status(409).json({ message: 'You are already a member of this team' });

    await Team.findByIdAndUpdate(team._id, { $addToSet: { members: req.user.id } });
    await Club.findByIdAndUpdate(club._id, { $addToSet: { members: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { joinedClubs: club._id, joinedTeams: team._id },
    });
    return res.json({ message: 'You joined the team successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function leaveTeam(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId).lean();
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const isMember = (team.members || []).some((memberId) => memberId.toString() === req.user.id);
    if (!isMember) return res.status(409).json({ message: 'You are not a member of this team' });

    const update = { $pull: { members: req.user.id } };
    if (team.captain && team.captain.toString() === req.user.id) update.$set = { captain: null };
    await Team.findByIdAndUpdate(team._id, update);
    await User.findByIdAndUpdate(req.user.id, { $pull: { joinedTeams: team._id } });
    return res.json({ message: 'You left the team successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function transferTeamLeadership(req, res, next) {
  try {
    const { teamId, newCaptainId } = req.params;
    const team = await Team.findById(teamId).lean();
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (!team.captain || team.captain.toString() !== req.user.id) return res.status(403).json({ message: 'Only the current captain can transfer leadership' });
    if (team.captain?.toString() === newCaptainId) return res.status(400).json({ message: 'That user is already the captain' });
    const newCaptain = await User.findById(newCaptainId).lean();
    if (!newCaptain) return res.status(404).json({ message: 'New captain not found' });
    if (!team.members.some((memberId) => memberId.toString() === newCaptainId)) return res.status(400).json({ message: 'New captain must already be a team member' });

    const updatedTeam = await Team.findOneAndUpdate(
      { _id: teamId, captain: req.user.id, members: newCaptainId },
      { $set: { captain: newCaptainId } },
      { new: true }
    );
    if (!updatedTeam) return res.status(403).json({ message: 'Team leadership changed; please retry' });
    return res.json({ message: 'Team leadership transferred' });
  } catch (error) {
    return next(error);
  }
}

export async function removeTeamMember(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const isCaptain = team.captain && team.captain.toString() === req.user.id;
    const club = await Club.findById(team.club);
    const isClubOwner = club?.owner?.toString() === req.user.id;
    if (!isCaptain && !isClubOwner) return res.status(403).json({ message: 'Only the captain or club admin can remove team members' });
    const removingCaptain = team.captain && team.captain.toString() === req.params.userId;
    if (removingCaptain && (!isClubOwner || req.params.userId === req.user.id)) {
      return res.status(400).json({ message: 'Only the club admin can remove the team captain' });
    }
    if (!team.members.some((memberId) => memberId.toString() === req.params.userId)) return res.status(404).json({ message: 'User is not a member of this team' });

    const update = { $pull: { members: req.params.userId } };
    if (removingCaptain) update.$set = { captain: null };
    await Team.findByIdAndUpdate(req.params.teamId, update);
    await User.findByIdAndUpdate(req.params.userId, { $pull: { joinedTeams: req.params.teamId } });
    return res.json({ message: 'Team member removed successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTeam(req, res, next) {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const club = await Club.findById(team.club);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    if (club.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the club owner can delete the team' });
    }

    await Team.findByIdAndDelete(req.params.id);
    await Club.findByIdAndUpdate(team.club, { $pull: { teams: req.params.id } });
    await User.updateMany({ joinedTeams: req.params.id }, { $pull: { joinedTeams: req.params.id } });
    return res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    return next(error);
  }
}
