import { Router } from 'express';
import { verifyAdminPassword } from '../services/adminService.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { password, username, email } = req.body || {};

    if (!password) {
      res.status(400).json({ error: 'password is required' });
      return;
    }

    const admin = await verifyAdminPassword(password, email || username);
    if (!admin) {
      res.status(401).json({ error: 'invalid credentials' });
      return;
    }

    res.json({ ok: true, admin });
  } catch (error) {
    res.status(500).json({ error: 'failed to login admin' });
  }
});

export default router;
