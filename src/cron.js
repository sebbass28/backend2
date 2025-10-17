import cron from 'node-cron';
import { query } from './db.js';

export function startCronJobs() {
  // run every day at 01:00
  cron.schedule('0 1 * * *', async () => {
    console.log('Running daily job: compute summaries');
    try {
      // Implement your summary computation logic here
    } catch (err) {
      console.error('Cron job error', err);
    }
  });
}