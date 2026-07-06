import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'sport-portal-secret',
    { expiresIn: '24h' }
  );
}

function toAuthResponse(user) {
  return {
    token: createToken(user),
    type: 'Bearer',
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

function generateFriendCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

async function createUniqueFriendCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateFriendCode();
    // eslint-disable-next-line no-await-in-loop
    const existing = await User.findOne({ friendCode: code }).lean();
    if (!existing) {
      return code;
    }
  }
  return `${generateFriendCode().slice(0, 7)}X`;
}

export async function register(req, res, next) {
  try {
    const { username, email, password, firstName = null, lastName = null } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] }).lean();
    if (existing) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    const friendCode = await createUniqueFriendCode();

    const user = await User.create({
      username,
      email,
      password,
      friendCode,
      firstName,
      lastName,
      role: 'ROLE_USER',
      active: true,
    });

    const token = createToken(user);
    return res.status(201).json(toAuthResponse(user, token));
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const lookup = username || email;

    if (!lookup || !password) {
      return res.status(400).json({ message: 'Username/email and password are required' });
    }

    const user = await User.findOne({ $or: [{ username: lookup }, { email: lookup }] });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);
    return res.json(toAuthResponse(user, token));
  } catch (error) {
    return next(error);
  }
}
