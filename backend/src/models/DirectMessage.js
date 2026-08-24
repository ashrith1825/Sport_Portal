import mongoose from 'mongoose';

const directMessageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

directMessageSchema.index({ from: 1, to: 1, createdAt: -1 });

export default mongoose.model('DirectMessage', directMessageSchema);
