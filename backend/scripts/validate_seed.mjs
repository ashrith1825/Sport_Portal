import dns from 'node:dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Club from '../src/models/Club.js';
import Team from '../src/models/Team.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'sport_portal';
if (!uri) throw new Error('MONGODB_URI is required');

await mongoose.connect(uri, { dbName });
try {
  const [users, clubs, teams] = await Promise.all([User.find({}).lean(), Club.find({}).lean(), Team.find({}).lean()]);
  const clubIds = new Set(clubs.map((club) => String(club._id)));
  const teamIds = new Set(teams.map((team) => String(team._id)));
  const clubMemberships = new Map();
  const teamMemberships = new Map();
  let duplicateClubMemberships = 0;
  let duplicateTeamMemberships = 0;
  let wrongClubMembers = 0;
  let orphanedMemberships = 0;

  for (const club of clubs) {
    const seen = new Set();
    for (const memberId of club.members || []) {
      const id = String(memberId);
      if (seen.has(id)) duplicateClubMemberships += 1;
      seen.add(id);
      if (!clubIds.has(String(club._id))) orphanedMemberships += 1;
      clubMemberships.set(id, [...(clubMemberships.get(id) || []), String(club._id)]);
    }
  }
  for (const team of teams) {
    const club = clubs.find((candidate) => String(candidate._id) === String(team.club));
    const clubMemberIds = new Set((club?.members || []).map((id) => String(id)));
    const seen = new Set();
    for (const memberId of team.members || []) {
      const id = String(memberId);
      if (seen.has(id)) duplicateTeamMemberships += 1;
      seen.add(id);
      if (!teamIds.has(String(team._id)) || !clubMemberIds.has(id)) {
        wrongClubMembers += 1;
      }
      teamMemberships.set(id, [...(teamMemberships.get(id) || []), String(team._id)]);
    }
  }

  const teamsWithoutExactlyOneCaptain = teams.filter((team) => {
    const captainCount = team.captain && (team.members || []).some((memberId) => String(memberId) === String(team.captain)) ? 1 : 0;
    return captainCount !== 1;
  }).length;
  const result = {
    totalClubs: clubs.length,
    totalTeams: teams.length,
    totalClubAdmins: new Set(clubs.map((club) => String(club.owner))).size,
    totalTeamCaptains: new Set(teams.map((team) => String(team.captain))).size,
    uniqueTeamMemberUsers: teamMemberships.size,
    memberCountsBySport: Object.fromEntries(teams.map((team) => [clubs.find((club) => String(club._id) === String(team.club))?.sportType, team.members?.length || 0])),
    usersInMultipleClubs: [...clubMemberships.values()].filter((ids) => new Set(ids).size > 1).length,
    usersInMultipleTeams: [...teamMemberships.values()].filter((ids) => new Set(ids).size > 1).length,
    duplicateTeamMemberships,
    duplicateClubMemberships,
    teamsWithoutExactlyOneCaptain,
    membersInWrongClub: wrongClubMembers,
    orphanedMemberships,
    totalUsers: users.length,
  };
  console.log(JSON.stringify(result, null, 2));
  if (Object.entries(result).some(([key, value]) => key !== 'totalUsers' && (key.startsWith('usersIn') || key.startsWith('duplicate') || key.startsWith('teamsWithout') || key.startsWith('membersIn') || key === 'orphanedMemberships') && value !== 0)) process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}