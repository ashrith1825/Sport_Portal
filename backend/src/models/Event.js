import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sportType: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    eventDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    maxParticipants: { type: Number, default: null },
    status: { type: String, enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'], default: 'UPCOMING' },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);