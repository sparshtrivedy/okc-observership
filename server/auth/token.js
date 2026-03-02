import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

function assertJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required in environment');
  }
}

export function signStudentToken({ userId, email, applicantId }) {
  assertJwtSecret();
  return jwt.sign({ sub: userId, email, role: 'student', applicantId }, JWT_SECRET, {
    expiresIn: '7d'
  });
}

export function signAdminToken({ userId, email }) {
  assertJwtSecret();
  return jwt.sign({ sub: userId, email, role: 'admin' }, JWT_SECRET, {
    expiresIn: '8h'
  });
}

export function verifyToken(token) {
  assertJwtSecret();
  return jwt.verify(token, JWT_SECRET);
}
