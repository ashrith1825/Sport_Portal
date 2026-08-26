import dns from 'node:dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Club from '../src/models/Club.js';
import Team from '../src/models/Team.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const dbName = process.env.MONGODB_DB || 'sport_portal';
await mongoose.connect(process.env.MONGODB_URI, { dbName });

const users = await User.find({});
const clubs = await Club.find({});
const userByName = Object.fromEntries(users.map((user) => [user.username, user]));
const clubBySport = Object.fromEntries(clubs.map((club) => [club.sportType, club]));

const cricketTeam = await Team.create({
  name: 'QA Cricket Temp',
  description: 'temporary authorization test',
  club: clubBySport.Cricket._id,
  captain: userByName.RohanBansal._id,
  members: [userByName.RohanBansal._id, userByName.AadhyaKulkarni._id, userByName.KabirMalhotra._id],
});
const footballTeam = await Team.create({
  name: 'QA Football Temp',
  description: 'temporary authorization test',
  club: clubBySport.Football._id,
  captain: userByName.DiyaMenon._id,
  members: [userByName.DiyaMenon._id, userByName.MyraSethi._id],
});

await Club.updateOne({ _id: clubBySport.Cricket._id }, { $addToSet: { teams: cricketTeam._id } });
await Club.updateOne({ _id: clubBySport.Football._id }, { $addToSet: { teams: footballTeam._id } });

async function login(username) {
  const response = await fetch('http://127.0.0.1:8080/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password: '123456' }),
  });
  return { status: response.status, token: (await response.json()).token };
}

async function request(path, method, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`http://127.0.0.1:8080${path}`, { method, headers });
  return response.status;
}

async function requestJson(path, method, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`http://127.0.0.1:8080${path}`, { method, headers });
  return { status: response.status, body: await response.json() };
}

try {
  const tokens = {
    admin1: (await login('AaravMehta')).token,
    admin2: (await login('AnanyaRao')).token,
    captain1: (await login('RohanBansal')).token,
    normal: (await login('AadhyaKulkarni')).token,
  };

  const result = {
    captainViewsOwnTeam: (await requestJson(`/api/teams/${cricketTeam._id}`, 'GET', tokens.captain1)).status,
    unauthenticatedDelete: await request(`/api/teams/${cricketTeam._id}`, 'DELETE'),
    crossClubAdminDelete: await request(`/api/teams/${footballTeam._id}`, 'DELETE', tokens.admin1),
    captainRemove: await request(`/api/teams/${cricketTeam._id}/members/${userByName.KabirMalhotra._id}`, 'DELETE', tokens.captain1),
    captainTransfer: await request(`/api/teams/${cricketTeam._id}/transfer/${userByName.AadhyaKulkarni._id}`, 'POST', tokens.captain1),
    oldCaptainCannotManage: await request(`/api/teams/${cricketTeam._id}/members/${userByName.KabirMalhotra._id}`, 'DELETE', tokens.captain1),
    admin2DeletesFootball: await request(`/api/teams/${footballTeam._id}`, 'DELETE', tokens.admin2),
    normalCannotDelete: await request(`/api/teams/${cricketTeam._id}`, 'DELETE', tokens.normal),
    admin1DeletesCricket: await request(`/api/teams/${cricketTeam._id}`, 'DELETE', tokens.admin1),
  };
  console.log(JSON.stringify(result, null, 2));
} finally {
  await Team.deleteMany({ name: { $in: ['QA Cricket Temp', 'QA Football Temp'] } });
  await Club.updateMany({}, { $pull: { teams: { $in: [cricketTeam._id, footballTeam._id] } } });
  await mongoose.disconnect();
}