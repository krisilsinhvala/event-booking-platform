import mongoose from 'mongoose';
import { environment } from './env.js';

export const connectDatabase = async () => {
  if (!environment.mongoUri) {
    throw new Error('MONGO_URI is not configured. Add it to the backend environment.');
  }

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (error) => {
    console.error(`MongoDB connection error: ${error.message}`);
  });

  await mongoose.connect(environment.mongoUri, {
    serverSelectionTimeoutMS: 10000
  });
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};