import User from '../models/User.js';
import Club from '../models/Club.js';
import Event from '../models/Event.js';
import Journal from '../models/Journal.js';
import Team from '../models/Team.js';

export async function seedDemoData() {
  // Find or create demo owner
  let demoOwner = await User.findOne({ username: 'sportdemo' });
  if (!demoOwner) {
    demoOwner = await User.create({
      username: 'sportdemo',
      email: 'demo@sportportal.local',
      password: 'Demo@12345',
      friendCode: 'SPORTDEM',
      firstName: 'Sport',
      lastName: 'Portal',
      role: 'ROLE_ORGANIZER',
      active: true,
    });
  }

  // Ensure at least 6 clubs exist for the demo owner
  const existingClubs = await Club.find({ owner: demoOwner._id }).lean();
  if (existingClubs.length < 6) {
    const clubsToAdd = [];
    const names = ['Metro Football Club', 'Court Masters', 'Racket Society', 'Harbor Runners', 'Steel City Cyclists', 'Mountain Climbers'];
    const types = ['Football', 'Basketball', 'Tennis', 'Running', 'Cycling', 'Climbing'];
    const descriptions = [
      'Competitive weekend football for urban players.',
      'Basketball sessions, drills, and pickup tournaments.',
      'Tennis, badminton, and racket sport community nights.',
      'Group runs, interval sessions, and weekend long-runs for all paces.',
      'Road and gravel rides with social and training groups.',
      'Indoor and outdoor climbing meetups, belay workshops, and trips.',
    ];

    for (let i = 0; i < names.length; i++) {
      const exists = existingClubs.find((c) => c.name === names[i]);
      if (!exists) {
        clubsToAdd.push({
          name: names[i],
          description: descriptions[i],
          sportType: types[i],
          logoUrl: '',
          owner: demoOwner._id,
          members: [demoOwner._id],
        });
      }
    }

    if (clubsToAdd.length > 0) {
      await Club.create(clubsToAdd);
    }
  }

  // Ensure at least 5 upcoming events exist
  const existingEvents = await Event.find({ organizer: demoOwner._id }).lean();
  if (existingEvents.length < 5) {
    const eventsToAdd = [
      {
        title: 'Sunday Scrimmage',
        description: 'Open football scrimmage for all levels.',
        sportType: 'Football',
        location: 'City Arena',
        latitude: 40.758,
        longitude: -73.9855,
        eventDate: new Date(Date.now() + 86400000 * 3),
        endDate: new Date(Date.now() + 86400000 * 3 + 7200000),
        maxParticipants: 20,
        status: 'UPCOMING',
        organizer: demoOwner._id,
        participants: [demoOwner._id],
      },
      {
        title: 'Evening Hoops Run',
        description: 'Fast-paced pickup basketball under the lights.',
        sportType: 'Basketball',
        location: 'North Court',
        latitude: 40.7612,
        longitude: -73.9776,
        eventDate: new Date(Date.now() + 86400000 * 5),
        endDate: new Date(Date.now() + 86400000 * 5 + 5400000),
        maxParticipants: 10,
        status: 'UPCOMING',
        organizer: demoOwner._id,
        participants: [demoOwner._id],
      },
      {
        title: 'Early Morning 5K',
        description: 'Community run for all paces.',
        sportType: 'Running',
        location: 'River Park',
        latitude: 40.77,
        longitude: -73.98,
        eventDate: new Date(Date.now() + 86400000 * 7),
        endDate: new Date(Date.now() + 86400000 * 7 + 3600000),
        maxParticipants: 50,
        status: 'UPCOMING',
        organizer: demoOwner._id,
        participants: [demoOwner._id],
      },
      {
        title: 'Gravel Grinder',
        description: 'Challenging mixed terrain ride.',
        sportType: 'Cycling',
        location: 'Old Mill Road',
        latitude: 40.78,
        longitude: -73.99,
        eventDate: new Date(Date.now() + 86400000 * 9),
        endDate: new Date(Date.now() + 86400000 * 9 + 10800000),
        maxParticipants: 40,
        status: 'UPCOMING',
        organizer: demoOwner._id,
        participants: [demoOwner._id],
      },
      {
        title: 'Doubles Ladder Night',
        description: 'Friendly doubles ladder for local players.',
        sportType: 'Tennis',
        location: 'West Courts',
        latitude: 40.76,
        longitude: -73.98,
        eventDate: new Date(Date.now() + 86400000 * 11),
        endDate: new Date(Date.now() + 86400000 * 11 + 7200000),
        maxParticipants: 16,
        status: 'UPCOMING',
        organizer: demoOwner._id,
        participants: [demoOwner._id],
      },
    ];

    // Only create those that don't already exist by title
    for (const ev of eventsToAdd) {
      const exists = existingEvents.find((e) => e.title === ev.title);
      if (!exists) await Event.create(ev);
    }
  }

  // Ensure at least 6 journals exist
  const existingJournals = await Journal.find({ author: demoOwner._id }).lean();
  if (existingJournals.length < 6) {
    const journalsToAdd = [
      {
        title: 'Match Day Focus',
        content: 'Built a consistent warmup and played with better control today.',
        sportType: 'Football',
        imageUrl: '',
        author: demoOwner._id,
      },
      {
        title: 'First Tournament Run',
        content: 'Our team stayed calm in the final minutes and closed the game strong.',
        sportType: 'Basketball',
        imageUrl: '',
        author: demoOwner._id,
      },
      {
        title: 'Training Notes',
        content: 'Footwork and recovery drills made a noticeable difference this week.',
        sportType: 'Tennis',
        imageUrl: '',
        author: demoOwner._id,
      },
      {
        title: 'Road Ride Recovery',
        content: 'Recovery nutrition and easy spins helped the legs reset after a long ride.',
        sportType: 'Cycling',
        imageUrl: '',
        author: demoOwner._id,
      },
      {
        title: 'Pace Workouts That Stick',
        content: 'Short intervals at a comfortably hard pace built a stronger kick for the last km.',
        sportType: 'Running',
        imageUrl: '',
        author: demoOwner._id,
      },
      {
        title: 'Crux Tips for Beginners',
        content: 'Small body position changes unlock easier beta on common holds.',
        sportType: 'Climbing',
        imageUrl: '',
        author: demoOwner._id,
      },
    ];

    for (const j of journalsToAdd) {
      const exists = existingJournals.find((x) => x.title === j.title);
      if (!exists) await Journal.create(j);
    }
  }
}