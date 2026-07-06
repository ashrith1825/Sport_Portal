import Event from '../models/Event.js';
import User from '../models/User.js';
import { toEventDto } from './format.js';

async function enrichEvent(event) {
  if (!event) return null;
  const populated = await event.populate('organizer', 'username');
  return populated;
}

async function listEvents(filter = {}) {
  const events = await Event.find(filter).sort({ eventDate: 1 }).populate('organizer', 'username');
  return Promise.all(events.map(async (event) => toEventDto(await enrichEvent(event))));
}

export async function getEvents(req, res, next) {
  try {
    return res.json(await listEvents());
  } catch (error) {
    return next(error);
  }
}

export async function getUpcomingEvents(req, res, next) {
  try {
    return res.json(await listEvents({ eventDate: { $gte: new Date() } }));
  } catch (error) {
    return next(error);
  }
}

export async function getEventById(req, res, next) {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'username');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.json(toEventDto(await enrichEvent(event)));
  } catch (error) {
    return next(error);
  }
}

export async function getEventsBySport(req, res, next) {
  try {
    return res.json(await listEvents({ sportType: req.params.sportType }));
  } catch (error) {
    return next(error);
  }
}

export async function searchEvents(req, res, next) {
  try {
    const regex = new RegExp(req.query.keyword || '', 'i');
    return res.json(await listEvents({ $or: [{ title: regex }, { description: regex }, { location: regex }] }));
  } catch (error) {
    return next(error);
  }
}

export async function getMyEvents(req, res, next) {
  try {
    return res.json(await listEvents({ $or: [{ organizer: req.user.id }, { participants: req.user.id }] }));
  } catch (error) {
    return next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    const {
      title,
      description = null,
      sportType,
      location,
      latitude = null,
      longitude = null,
      eventDate,
      endDate = null,
      maxParticipants = null,
      status = 'UPCOMING',
    } = req.body;

    if (!title || !sportType || !location || !eventDate) {
      return res.status(400).json({ message: 'Title, sportType, location, and eventDate are required' });
    }

    const event = await Event.create({ title, description, sportType, location, latitude, longitude, eventDate, endDate, maxParticipants, status, organizer: req.user.id, participants: [req.user.id] });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedEvents: event._id } });
    return res.status(201).json(toEventDto(await enrichEvent(await Event.findById(event._id).populate('organizer', 'username'))));
  } catch (error) {
    return next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer can update this event' });
    }

    const updates = {};
    for (const key of ['title', 'description', 'sportType', 'location', 'latitude', 'longitude', 'eventDate', 'endDate', 'maxParticipants', 'status']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No event fields were provided' });
    }

    await Event.findByIdAndUpdate(req.params.id, updates);
    return res.json(toEventDto(await enrichEvent(await Event.findById(req.params.id).populate('organizer', 'username'))));
  } catch (error) {
    return next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer can delete this event' });
    }

    await User.updateMany({ joinedEvents: event._id }, { $pull: { joinedEvents: event._id } });
    await Event.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function joinEvent(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    await Event.findByIdAndUpdate(req.params.id, { $addToSet: { participants: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedEvents: event._id } });
    return res.json({ message: 'Joined event successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function leaveEvent(req, res, next) {
  try {
    await Event.findByIdAndUpdate(req.params.id, { $pull: { participants: req.user.id } });
    await User.findByIdAndUpdate(req.user.id, { $pull: { joinedEvents: req.params.id } });
    return res.json({ message: 'Left event successfully' });
  } catch (error) {
    return next(error);
  }
}