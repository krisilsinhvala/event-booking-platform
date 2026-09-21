import dotenv from 'dotenv';

dotenv.config();

const requiredEnvironmentVariables = ['JWT_SECRET', 'MONGO_URI'];
const hasMongoUri = Boolean(process.env.MONGO_URI || process.env.MONGODB_URI);

if (process.env.NODE_ENV === 'production') {
  const missingVariables = requiredEnvironmentVariables.filter((variableName) => {
    if (variableName === 'MONGO_URI') return !hasMongoUri;
    return !process.env[variableName];
  });

  if (missingVariables.length > 0) {
    throw new Error(`Missing environment variables: ${missingVariables.join(', ')}`);
  }
}

export const environment = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientUrl: (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, ''),
  clientUrls: (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean),
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  smtpFrom: process.env.SMTP_FROM || 'Eventora <no-reply@example.com>',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  adminName: process.env.ADMIN_NAME || 'Eventora Admin',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  seedEvents: process.env.SEED_EVENTS !== 'false',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  minUpcomingEvents: Number(process.env.MIN_UPCOMING_EVENTS) || 10,
  eventGeneratorCooldownMinutes: Number(process.env.EVENT_GENERATOR_COOLDOWN_MINUTES) || 60,
  eventGenerationEnabled: process.env.EVENT_GENERATION_ENABLED !== 'false'
};
