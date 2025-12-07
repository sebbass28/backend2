import http from 'http';
import app from './app.js';
import { initSockets } from './socket.js';
import { startCronJobs } from './cron.js';
import { runMigrations } from './db/migrate.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// sockets
initSockets(server);

// cron jobs
startCronJobs();

// Run migrations and then start server
runMigrations().then(() => {
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to run migrations:', err);
  // Still start server? Maybe not safe, but better than crashing loop
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (migrations failed)`);
  });
});
