import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-change-this-secret';

export function signStudentToken({ userId, email, applicantId }) {
  return jwt.sign({ sub: userId, email, role: 'student', applicantId }, JWT_SECRET, {
    expiresIn: '7d'
  });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
