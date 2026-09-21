import '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { seedEvents } from '../services/eventSeedService.js';

const run = async () => {
  console.log('Connecting to database...');
  await connectDatabase();
  console.log('Running event seed check...');
  await seedEvents({ force: true });
};

try {
  await run();
} catch (error) {
  console.error(`Manual seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
