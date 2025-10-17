import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';

export async function exportTransactionsToCSV(transactions, filename='transactions.csv') {
  const filePath = path.join(process.cwd(), 'src', 'uploads', filename);
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: Object.keys(transactions[0] || {}).map(k => ({ id: k, title: k }))
  });
  await csvWriter.writeRecords(transactions);
  return filePath;
}