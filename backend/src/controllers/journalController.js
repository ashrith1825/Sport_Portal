import Journal from '../models/Journal.js';
import User from '../models/User.js';
import { toJournalDto } from './format.js';

async function listJournals(filter = {}) {
  const journals = await Journal.find(filter).sort({ createdAt: -1 }).populate('author', 'username');
  return journals.map(toJournalDto);
}

export async function getJournals(req, res, next) {
  try {
    return res.json(await listJournals());
  } catch (error) {
    return next(error);
  }
}

export async function getJournalById(req, res, next) {
  try {
    const journal = await Journal.findById(req.params.id).populate('author', 'username');
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    return res.json(toJournalDto(journal));
  } catch (error) {
    return next(error);
  }
}

export async function getJournalsBySport(req, res, next) {
  try {
    return res.json(await listJournals({ sportType: req.params.sportType }));
  } catch (error) {
    return next(error);
  }
}

export async function searchJournals(req, res, next) {
  try {
    const regex = new RegExp(req.query.keyword || '', 'i');
    return res.json(await listJournals({ $or: [{ title: regex }, { content: regex }, { sportType: regex }] }));
  } catch (error) {
    return next(error);
  }
}

export async function getMyJournals(req, res, next) {
  try {
    return res.json(await listJournals({ author: req.user.id }));
  } catch (error) {
    return next(error);
  }
}

export async function createJournal(req, res, next) {
  try {
    const { title, content, sportType, imageUrl = null } = req.body;
    if (!title || !content || !sportType) {
      return res.status(400).json({ message: 'Title, content, and sportType are required' });
    }

    const journal = await Journal.create({ title, content, sportType, imageUrl, author: req.user.id });
    const populated = await Journal.findById(journal._id).populate('author', 'username');
    return res.status(201).json(toJournalDto(populated));
  } catch (error) {
    return next(error);
  }
}

export async function updateJournal(req, res, next) {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    if (journal.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the author can update this journal' });
    }

    const updates = {};
    for (const key of ['title', 'content', 'sportType', 'imageUrl']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No journal fields were provided' });
    }

    await Journal.findByIdAndUpdate(req.params.id, updates);
    const populated = await Journal.findById(req.params.id).populate('author', 'username');
    return res.json(toJournalDto(populated));
  } catch (error) {
    return next(error);
  }
}

export async function deleteJournal(req, res, next) {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }

    if (journal.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the author can delete this journal' });
    }

    await Journal.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    return next(error);
  }
}