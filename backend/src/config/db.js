import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || 'sport_portal',
    });
  } catch (error) {
    const isSrvLookupFailure = uri.startsWith('mongodb+srv://') && (
      error?.code === 'ENOTFOUND' ||
      error?.message?.includes('querySrv')
    );
    if (isSrvLookupFailure) {
      const host = new URL(uri).hostname;
      throw new Error(
        `MongoDB Atlas SRV lookup failed for host "${host}". Verify DNS/network access and update MONGODB_URI with the current connection string from Atlas.`,
        { cause: error }
      );
    }
    throw error;
  }
}

export default mongoose;