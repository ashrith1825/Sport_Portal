import mongoose from 'mongoose';

const clubRequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['CLUB_JOIN', 'TEAM_CREATE', 'TEAM_JOIN', 'TEAM_LEAVE', 'TEAM_DELETE'],
      required: true,
    },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', default: null },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    message: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.model('ClubRequest', clubRequestSchema);
