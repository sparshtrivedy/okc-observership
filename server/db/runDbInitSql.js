import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbPool } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const sqlPath = path.resolve(__dirname, '../../db_init.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');

  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('db_init.sql applied successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await dbPool.end();
  }
}

run().catch((error) => {
  console.error('Failed to apply db_init.sql:', error.message);
  process.exitCode = 1;
});
