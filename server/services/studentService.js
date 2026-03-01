import bcrypt from 'bcryptjs';
import { db } from '../db/client.js';
import { getApplicantByUserId } from './applicantService.js';

export async function verifyStudentPassword(email, password) {
  const result = await db.query('SELECT id, email, password_hash, role FROM users WHERE email = $1 AND role = $2', [
    email,
    'student'
  ]);

  if (result.rowCount === 0) return null;

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}

export async function getStudentProfileByUserId(userId) {
  return getApplicantByUserId(userId);
}
