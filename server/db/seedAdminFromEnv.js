import 'dotenv/config';
import { db, dbPool } from './client.js';
import { seedBootstrapAdmin } from '../services/adminService.js';

async function run() {
  try {
    const seeded = await seedBootstrapAdmin({ removeOtherAdmins: true });
    const admins = await db.query('SELECT id, email, role FROM users WHERE role = $1 ORDER BY id', ['admin']);

    console.log('Admin seed complete.');
    console.log(`Active admin: ${seeded.email}`);
    console.log('Current admin users:', admins.rows);
  } catch (error) {
    console.error('Failed to seed admin from env:', error.message);
    process.exitCode = 1;
  } finally {
    await dbPool.end();
  }
}

run();
