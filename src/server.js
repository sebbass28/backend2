import http from 'http';
import app from './app.js';
import { initSockets } from './socket.js';
import { startCronJobs } from './cron.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// sockets
initSockets(server);

// cron jobs
startCronJobs();

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});