import './config/env.js';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { environment } from './config/env.js';
import { seedEvents } from './services/eventSeedService.js';
import { checkAndGenerateEvents } from './services/eventAutoGenerator.js';

const startServer = async () => {
  const server = app.listen(environment.port, () => {
    console.log(`Eventora API listening on port ${environment.port}`);
  });

  try {
    await connectDatabase();
    await seedEvents();
    // Automatically generate future events if needed (non-blocking on failure)
    try {
      await checkAndGenerateEvents();
    } catch (generatorError) {
      console.error(`[Event Generator] Startup check failed: ${generatorError.message}`);
    }
  } catch (error) {
    console.error(`MongoDB unavailable: ${error.message}`);
    console.error('The API is running, but database features require a valid MONGO_URI.');
  }

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully.`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});
