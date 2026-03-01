import { verifyToken } from '../auth/token.js';

export function requireStudentAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'missing auth token' });
    return;
  }

  try {
    const payload = verifyToken(token);
    if (payload?.role !== 'student' || !payload?.sub) {
      res.status(401).json({ error: 'invalid auth token' });
      return;
    }

    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      applicantId: payload.applicantId
    };

    next();
  } catch {
    res.status(401).json({ error: 'invalid or expired auth token' });
  }
}
