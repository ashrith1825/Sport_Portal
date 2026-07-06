import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    friendCode: { type: String, required: true, unique: true, uppercase: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['ROLE_USER', 'ROLE_ORGANIZER', 'ROLE_ADMIN'], default: 'ROLE_USER' },
    active: { type: Boolean, default: true },
    joinedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
    joinedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (this.password?.startsWith('$2a$') || this.password?.startsWith('$2b$')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.toAuthJSON = function toAuthJSON(token) {
  return {
    token,
    type: 'Bearer',
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    role: this.role,
  };
};

export default mongoose.model('User', userSchema);