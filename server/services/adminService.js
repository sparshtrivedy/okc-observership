import bcrypt from 'bcryptjs';
import { db } from '../db/client.js';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL || process.env.ADMIN_BOOTSTRAP_USERNAME || 'admin';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'okcadmin';

export async function ensureBootstrapAdmin() {
  const existing = await db.query('SELECT id FROM users WHERE email = $1 AND role = $2', [DEFAULT_ADMIN_EMAIL, 'admin']);
  if (existing.rowCount > 0) return;

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await db.query(
    `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'admin')
    `,
    [DEFAULT_ADMIN_EMAIL, passwordHash]
  );

  console.log(`Bootstrapped admin user: ${DEFAULT_ADMIN_EMAIL}`);
}

export async function verifyAdminPassword(password, email = DEFAULT_ADMIN_EMAIL) {
  const result = await db.query('SELECT id, email, password_hash, role FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
  if (result.rowCount === 0) return null;

  const admin = result.rows[0];
  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) return null;

  return {
    id: admin.id,
    email: admin.email,
    role: admin.role
  };
}
