import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import adminRoutes from './routes/adminRoutes.js';
import adminAnalyticsRoutes from './routes/adminAnalyticsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { environment } from './config/env.js';
import eventRoutes from './routes/eventRoutes.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const allowedOrigins = [
  ...environment.clientUrls,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].map((url) => url.replace(/\/$/, '')).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(currentDirectory, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAnalyticsRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Eventora API is running',
    data: {
      environment: environment.nodeEnv,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    }
  });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
