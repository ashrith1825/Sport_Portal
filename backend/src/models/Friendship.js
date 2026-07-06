import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    friend: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
    pairKey: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

friendshipSchema.index({ user: 1, friend: 1 }, { unique: true });

export default mongoose.model('Friendship', friendshipSchema);