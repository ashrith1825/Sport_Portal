import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || 'sport_portal',
  });
}

export default mongoose;