import bcrypt from 'bcryptjs';
import { db } from '../db/client.js';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL || process.env.ADMIN_BOOTSTRAP_USERNAME;
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD;

function assertBootstrapAdminConfig() {
  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
    throw new Error('ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD must be set in .env');
  }
}

export async function seedBootstrapAdmin({ removeOtherAdmins = false } = {}) {
  assertBootstrapAdminConfig();

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  await db.query(
    `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, 'admin')
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'admin',
        updated_at = NOW()
    `,
    [DEFAULT_ADMIN_EMAIL, passwordHash]
  );

  if (removeOtherAdmins) {
    await db.query(
      `
        DELETE FROM users
        WHERE role = 'admin'
          AND email <> $1
      `,
      [DEFAULT_ADMIN_EMAIL]
    );
  }

  return { email: DEFAULT_ADMIN_EMAIL };
}

export async function ensureBootstrapAdmin() {
  const seeded = await seedBootstrapAdmin({ removeOtherAdmins: false });
  console.log(`Bootstrapped admin user: ${seeded.email}`);
}

export async function verifyAdminPassword(password, email = DEFAULT_ADMIN_EMAIL) {
  if (!email) return null;
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
