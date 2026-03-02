import { Router } from 'express';
import { verifyAdminPassword } from '../services/adminService.js';
import { signAdminToken } from '../auth/token.js';
import { requireAdminAuth } from '../middleware/requireAdminAuth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { password, username, email } = req.body || {};
    const identifier = email || username;

    if (!identifier || !password) {
      res.status(400).json({ error: 'email/username and password are required' });
      return;
    }

    const admin = await verifyAdminPassword(password, identifier);
    if (!admin) {
      res.status(401).json({ error: 'invalid credentials' });
      return;
    }

    const token = signAdminToken({ userId: admin.id, email: admin.email });
    res.json({ ok: true, admin, token });
  } catch (error) {
    res.status(500).json({ error: 'failed to login admin' });
  }
});

router.get('/me', requireAdminAuth, (req, res) => {
  res.json({
    admin: {
      id: req.auth.userId,
      email: req.auth.email,
      role: req.auth.role
    }
  });
});

export default router;
