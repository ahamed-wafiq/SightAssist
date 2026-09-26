import mongoose from 'mongoose';

/**
 * Connect to MongoDB instance using environment variable MONGODB_URI
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sightassist';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[SightAssist DB] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[SightAssist DB] MongoDB Connection Warning: ${error.message}`);
    console.warn(`[SightAssist DB] Server is running. Ensure MongoDB is running at ${uri} for persistence features.`);
    return false;
  }
};

/**
 * Helper to check current database connection state
 */
export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};
