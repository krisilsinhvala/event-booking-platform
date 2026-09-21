import '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import User from '../models/User.js';
import { environment } from '../config/env.js';

const seedAdmin = async () => {
  if (!environment.adminEmail || !environment.adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in backend/.env.');
  }

  await connectDatabase();

  const normalizedEmail = environment.adminEmail.toLowerCase().trim();
  const existingAdmin = await User.findOne({ email: normalizedEmail });

  if (existingAdmin) {
    console.log(`Admin already exists: ${normalizedEmail}`);
    return;
  }

  await User.create({
    name: environment.adminName,
    email: normalizedEmail,
    password: environment.adminPassword,
    role: 'admin',
    isVerified: true
  });

  console.log(`Admin created: ${normalizedEmail}`);
};

try {
  await seedAdmin();
} catch (error) {
  console.error(`Admin seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}