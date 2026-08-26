import Team from '../models/Team.js';
import Club from '../models/Club.js';
import User from '../models/User.js';
import ClubRequest from '../models/ClubRequest.js';
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

export async function getTeamRequests(req, res, next) {
  try {
    const team = await Team.findById(req.params.id).lean();
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const club = await Club.findById(team.club).lean();
    const canView = team.captain?.toString() === req.user.id || club?.owner?.toString() === req.user.id;
    if (!canView) return res.status(403).json({ message: 'Not authorized to view team requests' });

    const requests = await ClubRequest.find({ team: team._id, status: 'PENDING' })
      .sort({ createdAt: -1 })
      .populate('user', 'username firstName lastName')
      .lean();

    return res.json(requests);
  } catch (error) {
    return next(error);
  }
}

export async function createTeam(req, res, next) {
  try {
    const { clubId, name, description = '', captainId = req.user.id } = req.body;
    if (!clubId || !name) {
      return res.status(400).json({ message: 'clubId and name are required' });
    }

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    const isMember = (club.members || []).some((memberId) => memberId.toString() === req.user.id) || club.owner.toString() === req.user.id;
    if (!isMember) {
      return res.status(403).json({ message: 'Only club members can request a team' });
    }

    const alreadyCaptain = await Team.exists({ captain: req.user.id });
    if (alreadyCaptain) {
      return res.status(409).json({ message: 'A team captain can lead only one team' });
    }

    const existingPending = await ClubRequest.findOne({
      type: 'TEAM_CREATE',
      club: clubId,
      requestedBy: req.user.id,
      status: 'PENDING',
    }).lean();

    if (existingPending) {
      return res.status(409).json({ message: 'A team creation request is already pending for this club' });
    }

    const request = await ClubRequest.create({
      type: 'TEAM_CREATE',
      club: clubId,
      user: req.user.id,
      requestedBy: req.user.id,
      name,
      description,
      message: 'Requested team creation',
      status: 'PENDING',
    });

    return res.status(202).json({ message: 'Team creation request sent for club admin approval', requestId: request._id });
  } catch (error) {
    return next(error);
  }
}

export async function requestTeamJoin(req, res, next) {
  try {
    const { teamId, message = '' } = req.body;
    const team = await Team.findById(teamId).lean();
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const club = await Club.findById(team.club).lean();
    if (!club) return res.status(404).json({ message: 'Club not found' });

    const isClubMember = (club.members || []).some((memberId) => memberId.toString() === req.user.id) || club.owner.toString() === req.user.id;
    if (!isClubMember) return res.status(403).json({ message: 'You must be a club member before joining a team' });

    const isMember = (team.members || []).some((memberId) => memberId.toString() === req.user.id);
    if (isMember) return res.status(409).json({ message: 'You are already a member of this team' });

    const existingPending = await ClubRequest.findOne({ type: 'TEAM_JOIN', team: team._id, requestedBy: req.user.id, status: 'PENDING' }).lean();
    if (existingPending) return res.status(409).json({ message: 'A team join request is already pending' });

    const request = await ClubRequest.create({
      type: 'TEAM_JOIN',
      club: team.club,
      team: team._id,
      user: req.user.id,
      requestedBy: req.user.id,
      message: message || 'Requested team membership',
      status: 'PENDING',
    });

    return res.status(202).json({ message: 'Team join request sent', requestId: request._id });
  } catch (error) {
    return next(error);
  }
}

export async function requestTeamLeave(req, res, next) {
  try {
    const { teamId, message = '' } = req.body;
    const team = await Team.findById(teamId).lean();
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.captain && team.captain.toString() === req.user.id) {
      return res.status(400).json({ message: 'Captain must transfer leadership before leaving' });
    }

    const isMember = (team.members || []).some((memberId) => memberId.toString() === req.user.id);
    if (!isMember) return res.status(409).json({ message: 'You are not a member of this team' });

    const existingPending = await ClubRequest.findOne({ type: 'TEAM_LEAVE', team: team._id, requestedBy: req.user.id, status: 'PENDING' }).lean();
    if (existingPending) return res.status(409).json({ message: 'A leave request is already pending' });

    const request = await ClubRequest.create({
      type: 'TEAM_LEAVE',
      club: team.club,
      team: team._id,
      user: req.user.id,
      requestedBy: req.user.id,
      message: message || 'Requested team departure approval',
      status: 'PENDING',
    });

    return res.status(202).json({ message: 'Team leave request sent', requestId: request._id });
  } catch (error) {
    return next(error);
  }
}

export async function requestTeamDeletion(req, res, next) {
  try {
    const { teamId } = req.body;
    const team = await Team.findById(teamId).lean();
    if (!team) return res.status(404).json({ message: 'Team not found' });
    if (team.captain && team.captain.toString() !== req.user.id) return res.status(403).json({ message: 'Only the team captain can request deletion' });

    const existingPending = await ClubRequest.findOne({ type: 'TEAM_DELETE', team: team._id, status: 'PENDING' }).lean();
    if (existingPending) return res.status(409).json({ message: 'A deletion request is already pending' });

    const request = await ClubRequest.create({
      type: 'TEAM_DELETE',
      club: team.club,
      team: team._id,
      user: req.user.id,
      requestedBy: req.user.id,
      message: 'Requested team deletion escalation',
      status: 'PENDING',
    });

    return res.status(202).json({ message: 'Team deletion request sent to club admin', requestId: request._id });
  } catch (error) {
    return next(error);
  }
}

export async function approveTeamRequest(req, res, next) {
  try {
    const { requestId } = req.params;
    const { decision } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(decision)) return res.status(400).json({ message: 'Decision must be APPROVED or REJECTED' });

    const request = await ClubRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const team = request.team ? await Team.findById(request.team) : null;
    const club = request.club ? await Club.findById(request.club) : null;

    const canAct = (
      (team && team.captain && team.captain.toString() === req.user.id) ||
      (club && club.owner && club.owner.toString() === req.user.id)
    );

    if (!canAct) return res.status(403).json({ message: 'Not authorized to review this request' });

    request.status = decision;
    request.reviewedBy = req.user.id;
    await request.save();

    if (decision === 'APPROVED') {
      if (request.type === 'TEAM_JOIN') {
        await Team.findByIdAndUpdate(request.team, { $addToSet: { members: request.user } });
        await User.findByIdAndUpdate(request.user, { $addToSet: { joinedTeams: request.team } });
      }

      if (request.type === 'TEAM_LEAVE') {
        await Team.findByIdAndUpdate(request.team, { $pull: { members: request.user } });
        await User.findByIdAndUpdate(request.user, { $pull: { joinedTeams: request.team } });
      }

      if (request.type === 'TEAM_CREATE') {
        const newTeam = await Team.create({
          name: request.name || 'New Team',
          description: request.description || '',
          club: request.club,
          captain: request.user,
          members: [request.user],
        });
        await Club.findByIdAndUpdate(request.club, { $addToSet: { teams: newTeam._id } });
        await User.findByIdAndUpdate(request.user, { $addToSet: { joinedTeams: newTeam._id } });
      }

      if (request.type === 'TEAM_DELETE') {
        const teamId = request.team;
        await Team.findByIdAndDelete(teamId);
        await Club.findByIdAndUpdate(request.club, { $pull: { teams: teamId } });
        await User.updateMany({ joinedTeams: teamId }, { $pull: { joinedTeams: teamId } });
      }
    }

    return res.json({ message: `Request ${decision.toLowerCase()}` });
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

export async function addTeamMember(req, res, next) {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    const isCaptain = team.captain && team.captain.toString() === req.user.id;
    const club = await Club.findById(team.club);
    const isClubOwner = club?.owner?.toString() === req.user.id;
    if (!isCaptain && !isClubOwner) return res.status(403).json({ message: 'Only the captain or club owner can manage members' });
    const member = await User.findById(req.params.userId).lean();
    if (!member) return res.status(404).json({ message: 'User not found' });
    const isClubMember = club?.members?.some((memberId) => memberId.toString() === req.params.userId) || club?.owner?.toString() === req.params.userId;
    if (!isClubMember) return res.status(400).json({ message: 'User must belong to the club before joining its team' });
    await Team.findByIdAndUpdate(req.params.teamId, { $addToSet: { members: req.params.userId } });
    await User.findByIdAndUpdate(req.params.userId, { $addToSet: { joinedTeams: req.params.teamId } });
    return res.json({ message: 'Team member added successfully' });
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
    if (!isCaptain && !isClubOwner) return res.status(403).json({ message: 'Only the captain or club owner can manage team members' });
    if (team.captain && team.captain.toString() === req.params.userId) return res.status(400).json({ message: 'Transfer leadership before removing the captain' });
    if (!team.members.some((memberId) => memberId.toString() === req.params.userId)) return res.status(404).json({ message: 'User is not a member of this team' });

    await Team.findByIdAndUpdate(req.params.teamId, { $pull: { members: req.params.userId } });
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
    await ClubRequest.deleteMany({ team: req.params.id });
    return res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    return next(error);
  }
}
