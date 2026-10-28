import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Journal from '../models/Journal.js';
import User from '../models/User.js';

const migrationId = '2026-10-refresh-public-events-and-journals';
const authorUsernames = ['AaravMehta', 'AnanyaRao', 'VivaanShah', 'IshitaNair', 'ArjunKapoor', 'KavyaIyer'];
const oldEventIds = [
  '6a4bc5809bd65e1882567bd5',
  '6a4bc5809bd65e1882567bd6',
  '6a4bd0c467bbbd1d1c52335c',
  '6a4bd0c467bbbd1d1c52335e',
  '6a4bd0c467bbbd1d1c523360',
].map((id) => new mongoose.Types.ObjectId(id));
const oldJournalIds = [
  '6a4be192c3b8061e7a2ba97c',
  '6a4bd0c467bbbd1d1c523367',
  '6a4bd0c467bbbd1d1c523365',
  '6a4bd0c467bbbd1d1c523363',
  '6a4bc5809bd65e1882567bdb',
  '6a4bc5809bd65e1882567bdc',
  '6a4bc5809bd65e1882567bda',
].map((id) => new mongoose.Types.ObjectId(id));

const eventPlans = [
  { title: 'City Lights 5-a-Side', sportType: 'Football', description: 'A friendly evening scrimmage for all levels, with rotating teams and short matches.', location: 'City Arena', maxParticipants: 20 },
  { title: 'North Court Night Run', sportType: 'Basketball', description: 'Fast pickup basketball, open runs, and a relaxed post-game shootaround.', location: 'North Court', maxParticipants: 18 },
  { title: 'River Loop Community 5K', sportType: 'Running', description: 'A welcoming timed 5K with pace groups from easy jog to race effort.', location: 'River Park', maxParticipants: 60 },
  { title: 'Old Mill Gravel Ride', sportType: 'Cycling', description: 'A guided mixed-terrain ride with regroup points and route options.', location: 'Old Mill Road', maxParticipants: 30 },
  { title: 'West Courts Doubles Ladder', sportType: 'Tennis', description: 'Rotating doubles matches for local players, with all levels welcome.', location: 'West Courts', maxParticipants: 16 },
  { title: 'Shuttle Rally Open', sportType: 'Badminton', description: 'Social doubles and friendly round-robin games. Bring a racket or borrow one on site.', location: 'Shuttle Center', maxParticipants: 24 },
];

const journalPlans = [
  {
    title: 'Reading the Match Before It Opens', sportType: 'Football', author: 'AaravMehta',
    content: 'The biggest change in my game came from looking up sooner. Checking the space before the ball arrives gives me an extra moment to choose a simple pass, keep our shape, and help the whole side move together.',
    imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Small Adjustments, Better Footwork', sportType: 'Tennis', author: 'AnanyaRao',
    content: 'I used to focus on hitting harder when a rally got difficult. Splitting a little earlier and recovering to a balanced position helped more. The shots did not need to be spectacular; getting set for the next ball made the difference.',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'The Run You Can Repeat', sportType: 'Running', author: 'VivaanShah',
    content: 'A repeatable training week beats one heroic session. I keep most runs comfortable, add one focused interval workout, and leave enough room for sleep and recovery. That steady rhythm has made race pace feel less intimidating.',
    imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Beyond the First Smash', sportType: 'Badminton', author: 'IshitaNair',
    content: 'The point often turns on the shot after the smash. Recovering to the middle, keeping the racket up, and trusting a controlled next touch helped me stay in rallies instead of watching a good attack turn into an easy counter.',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'A Better Long-Ride Reset', sportType: 'Cycling', author: 'ArjunKapoor',
    content: 'After a long ride I used to skip the basics and wonder why the next session felt heavy. Water, a proper meal, and an easy spin the following day have become part of the ride itself, not an optional extra.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=85',
  },
  {
    title: 'Making Space in the Paint', sportType: 'Basketball', author: 'KavyaIyer',
    content: 'A good possession is not always about forcing a shot. A quick cut, a patient extra pass, and calling out the screen early opened better looks for everyone. The best run we had was the one where the whole team stayed involved.',
    imageUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=85',
  },
];

function randomFutureEventDate(now) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + 1 + Math.floor(Math.random() * 365));
  date.setUTCHours(8 + Math.floor(Math.random() * 12), Math.random() < 0.5 ? 0 : 30, 0, 0);
  return date;
}

export async function seedDemoData() {
  const migrations = mongoose.connection.collection('sport_portal_migrations');
  await migrations.createIndex({ _id: 1 });
  if (await migrations.findOne({ _id: migrationId })) return;

  const users = await User.find({ username: { $in: authorUsernames } }).select('username firstName lastName').lean();
  const usersByName = new Map(users.map((user) => [user.username, user]));
  const missingAuthors = authorUsernames.filter((username) => !usersByName.has(username));
  if (missingAuthors.length) {
    console.warn(`Skipping public content refresh; missing author accounts: ${missingAuthors.join(', ')}`);
    return;
  }

  const now = new Date();
  const events = eventPlans.map((plan, index) => {
    const organizer = usersByName.get(authorUsernames[index]);
    const eventDate = randomFutureEventDate(now);
    return {
      ...plan,
      eventDate,
      endDate: new Date(eventDate.getTime() + 90 * 60 * 1000),
      status: 'UPCOMING',
      organizer: organizer._id,
      participants: [organizer._id],
    };
  });
  const journals = journalPlans.map((plan) => {
    const { author: username, ...journal } = plan;
    return { ...journal, author: usersByName.get(username)._id };
  });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (await migrations.findOne({ _id: migrationId }, { session })) return;

      await Event.deleteMany({ _id: { $in: oldEventIds } }, { session });
      await Journal.deleteMany({ _id: { $in: oldJournalIds } }, { session });
      await User.updateMany(
        { joinedEvents: { $in: oldEventIds } },
        { $pull: { joinedEvents: { $in: oldEventIds } } },
        { session }
      );

      const createdEvents = await Event.insertMany(events, { session });
      await Journal.insertMany(journals, { session });
      await User.bulkWrite(createdEvents.map((event) => ({
        updateOne: {
          filter: { _id: event.organizer },
          update: { $addToSet: { joinedEvents: event._id } },
        },
      })), { session });

      await migrations.insertOne({ _id: migrationId, appliedAt: new Date() }, { session });
    });
    console.log('Refreshed public activity: 6 upcoming events and 6 authored journals.');
  } finally {
    await session.endSession();
  }
}