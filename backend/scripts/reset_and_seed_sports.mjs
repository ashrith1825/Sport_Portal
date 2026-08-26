import dns from 'node:dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Club from '../src/models/Club.js';
import Team from '../src/models/Team.js';
import ClubRequest from '../src/models/ClubRequest.js';
import ClubMessage from '../src/models/ClubMessage.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'sport_portal';
const password = '123456';

if (!uri) throw new Error('MONGODB_URI is required');

const adminBlueprints = [
  ['AaravMehta', 'Aarav', 'Mehta', 'ROLE_ORGANIZER'],
  ['AnanyaRao', 'Ananya', 'Rao', 'ROLE_ORGANIZER'],
  ['VivaanShah', 'Vivaan', 'Shah', 'ROLE_ORGANIZER'],
  ['IshitaNair', 'Ishita', 'Nair', 'ROLE_ORGANIZER'],
  ['ArjunKapoor', 'Arjun', 'Kapoor', 'ROLE_ORGANIZER'],
  ['KavyaIyer', 'Kavya', 'Iyer', 'ROLE_ORGANIZER'],
];

const captainBlueprints = [
  ['RohanBansal', 'Rohan', 'Bansal', 'ROLE_USER'],
  ['DiyaMenon', 'Diya', 'Menon', 'ROLE_USER'],
  ['AdityaJoshi', 'Aditya', 'Joshi', 'ROLE_USER'],
  ['MeeraDesai', 'Meera', 'Desai', 'ROLE_USER'],
  ['NeelVarma', 'Neel', 'Varma', 'ROLE_USER'],
  ['SaanviPillai', 'Saanvi', 'Pillai', 'ROLE_USER'],
];

const memberNames = [
  ['Kabir', 'Malhotra'], ['Myra', 'Sethi'], ['Reyansh', 'Gupta'], ['Aadhya', 'Kulkarni'],
  ['Ishaan', 'Chopra'], ['Anvi', 'Bhat'], ['Dhruv', 'Saxena'], ['Riya', 'Mishra'],
  ['Atharv', 'Patel'], ['Navya', 'Reddy'], ['Yuvan', 'Bose'], ['Siya', 'Verma'],
  ['Krish', 'Rangan'], ['Tara', 'Nair'], ['Ved', 'Menon'], ['Kiara', 'Joshi'],
  ['Arnav', 'Kaur'], ['Ira', 'Sharma'], ['Rudra', 'Pillai'], ['Mahi', 'Dutta'],
  ['Ayaan', 'Iyer'], ['Vanya', 'Kapoor'], ['Dev', 'Bansal'], ['Nitya', 'Rao'],
  ['Om', 'Kulkarni'], ['Aarohi', 'Desai'], ['Vihaan', 'Mehta'], ['Suhana', 'Shah'],
  ['Kiaan', 'Nair'], ['Meher', 'Varma'], ['Laksh', 'Gupta'], ['Anaya', 'Sethi'],
  ['Parth', 'Joshi'], ['Ishani', 'Mohan'], ['Yash', 'Chatterjee'], ['Aditi', 'Sinha'], ['Raghav', 'Arora'],
].map(([firstName, lastName]) => [`${firstName}${lastName}`, firstName, lastName, 'ROLE_USER']);

const accountBlueprints = [...adminBlueprints, ...captainBlueprints, ...memberNames];

const sports = [
  {
    name: 'Boundary Breakers',
    sportType: 'Cricket',
    logoUrl: 'https://www.vecteezy.com/free-vector/cricket-league-logo',
    description: 'Big shots, bigger vibes. Pull up for match-day energy, clean cover drives, and pure boundary-core chaos.',
    teamName: 'Powerplay Pandas',
    teamDescription: 'Fast starts, fearless swings, and a squad that keeps the scoreboard on main character mode.',
    rosterSize: 11,
  },
  {
    name: 'Goal Getter FC',
    sportType: 'Football',
    logoUrl: 'https://www.vecteezy.com/free-vector/football-team-logo',
    description: 'No boring passes here. High press, sharp fits, and weekend football with serious highlight-reel potential.',
    teamName: 'Neon Strikers',
    teamDescription: 'One-touch football, loud celebrations, and a front line that never leaves the group chat quiet.',
    rosterSize: 11,
  },
  {
    name: 'Hoop Theory',
    sportType: 'Basketball',
    logoUrl: 'https://www.magnific.com/free-photos-vectors/basketball-logo',
    description: 'Buckets only. A fast, fearless basketball crew for ankle-breakers, clutch threes, and court-side content.',
    teamName: 'Rim Runners',
    teamDescription: 'Run the floor, own the paint, and keep every possession looking effortlessly iconic.',
    rosterSize: 7,
  },
  {
    name: 'Set Point Society',
    sportType: 'Volleyball',
    logoUrl: 'https://www.vecteezy.com/free-vector/volleyball-logo',
    description: 'Serve it, save it, send it. A high-energy volleyball club built for clean sets and chaotic rallies.',
    teamName: 'Skyline Spikers',
    teamDescription: 'Big blocks, quick rotations, and enough court chemistry to make every rally cinematic.',
    rosterSize: 6,
  },
  {
    name: 'Shuttle Flex',
    sportType: 'Badminton',
    logoUrl: 'https://www.vecteezy.com/free-vector/badminton-club-logo',
    description: 'Quick feet, quicker reactions. Casual-to-competitive badminton with immaculate rally energy.',
    teamName: 'Smash Syndicate',
    teamDescription: 'Sharp drops, spicy smashes, and rallies that refuse to end on the first take.',
    rosterSize: 4,
  },
  {
    name: 'Baseline Club',
    sportType: 'Tennis',
    logoUrl: 'https://www.freepik.com/free-photos-vectors/tennis-logo',
    description: 'Serve looks, chase lines, and keep the baseline busy. Tennis for people who bring their own plot twist.',
    teamName: 'Ace Avenue',
    teamDescription: 'Clean serves, long rallies, and a competitive streak that is always ready for the next set.',
    rosterSize: 4,
  },
];

await mongoose.connect(uri, { dbName });

try {
  await Promise.all([
    Club.deleteMany({}),
    Team.deleteMany({}),
    ClubRequest.deleteMany({}),
    ClubMessage.deleteMany({}),
    User.deleteMany({}),
  ]);
  const users = [];

  for (let index = 0; index < accountBlueprints.length; index += 1) {
    const [username, firstName, lastName, role] = accountBlueprints[index];
    const email = `${username.toLowerCase()}@sportportal.local`;
    users.push(await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      friendCode: `SP${String(index + 1).padStart(6, '0')}`,
      active: true,
    }));
  }

  const admins = users.slice(0, 6);
  const captains = users.slice(6, 12);
  const memberUsers = users.slice(12);
  const createdClubs = [];
  const createdTeams = [];

  for (let index = 0; index < sports.length; index += 1) {
    const sport = sports[index];
    const admin = admins[index];
    const captain = captains[index];
    const club = await Club.create({
      name: sport.name,
      description: sport.description,
      sportType: sport.sportType,
      logoUrl: sport.logoUrl,
      owner: admin._id,
      members: [admin._id, captain._id],
      teams: [],
    });

    const memberStart = sports.slice(0, index).reduce((total, previousSport) => total + previousSport.rosterSize - 1, 0);
    const roster = [captain, ...memberUsers.slice(memberStart, memberStart + sport.rosterSize - 1)];

    const team = await Team.create({
      name: sport.teamName,
      description: sport.teamDescription,
      club: club._id,
      captain: captain._id,
      members: roster.map((member) => member._id),
    });

    club.teams = [team._id];
    club.members = [...new Set([admin._id.toString(), ...roster.map((member) => member._id.toString())])];
    await club.save();

    for (const member of club.members) {
      await User.updateOne({ _id: member }, { $addToSet: { joinedClubs: club._id } });
    }
    for (const member of roster) {
      await User.updateOne({ _id: member._id }, { $addToSet: { joinedTeams: team._id } });
    }

    createdClubs.push(club);
    createdTeams.push({ team, captain, admin, rosterSize: roster.length });
  }

  console.log(JSON.stringify({
    totalAccounts: await User.countDocuments({}),
    clubsCreated: createdClubs.length,
    teamsCreated: createdTeams.length,
    admins: admins.map((user) => ({ username: user.username, email: user.email, password })),
    captains: captains.map((user) => ({ username: user.username, email: user.email, password })),
    teams: createdTeams.map(({ team, captain, admin, rosterSize }) => ({
      sport: sports.find((sport) => sport.teamName === team.name)?.sportType,
      club: sports.find((sport) => sport.teamName === team.name)?.name,
      team: team.name,
      admin: admin.username,
      captain: captain.username,
      members: rosterSize,
    })),
  }, null, 2));
} finally {
  await mongoose.disconnect();
}