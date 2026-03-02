import { verifyToken } from '../auth/token.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'missing auth token' });
    return;
  }

  try {
    const payload = verifyToken(token);
    if (!payload?.sub || !payload?.role) {
      res.status(401).json({ error: 'invalid auth token' });
      return;
    }

    req.auth = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      applicantId: payload.applicantId || null
    };

    next();
  } catch {
    res.status(401).json({ error: 'invalid or expired auth token' });
  }
}
