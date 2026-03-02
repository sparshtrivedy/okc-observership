import { requireAuth } from './requireAuth.js';

export function requireAdminAuth(req, res, next) {
  requireAuth(req, res, () => {
    if (req.auth?.role !== 'admin') {
      res.status(403).json({ error: 'admin access required' });
      return;
    }

    next();
  });
}
