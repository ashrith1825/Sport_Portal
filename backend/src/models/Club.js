import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sportType: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  },
  { timestamps: true }
);

export default mongoose.model('Club', clubSchema);