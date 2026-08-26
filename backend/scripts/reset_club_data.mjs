import dns from 'node:dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Club from '../src/models/Club.js';
import Team from '../src/models/Team.js';
import ClubMessage from '../src/models/ClubMessage.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'sport_portal';

if (!uri) {
  throw new Error('MONGODB_URI is required');
}

await mongoose.connect(uri, { dbName });

const clubsDeleted = await Club.deleteMany({});
const teamsDeleted = await Team.deleteMany({});
const clubMessagesDeleted = await ClubMessage.deleteMany({});
const usersUpdated = await User.updateMany(
  {},
  { $set: { joinedClubs: [], joinedTeams: [] } }
);

const remainingClubs = await Club.countDocuments({});
const remainingTeams = await Team.countDocuments({});
const remainingClubMessages = await ClubMessage.countDocuments({});

console.log(JSON.stringify({
  clubsDeleted: clubsDeleted.deletedCount,
  teamsDeleted: teamsDeleted.deletedCount,
  clubMessagesDeleted: clubMessagesDeleted.deletedCount,
  usersUpdated: usersUpdated.modifiedCount,
  remainingClubs,
  remainingTeams,
  remainingClubMessages,
}, null, 2));

await mongoose.disconnect();
