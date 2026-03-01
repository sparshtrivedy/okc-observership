import { Router } from 'express';
import { requireStudentAuth } from '../middleware/requireStudentAuth.js';
import { getStudentProfileByUserId, verifyStudentPassword } from '../services/studentService.js';
import { signStudentToken } from '../auth/token.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    const student = await verifyStudentPassword(email, password);
    if (!student) {
      res.status(401).json({ error: 'invalid credentials' });
      return;
    }

    const applicant = await getStudentProfileByUserId(student.id);
    if (!applicant) {
      res.status(404).json({ error: 'student profile not found' });
      return;
    }

    const token = signStudentToken({ userId: student.id, email: student.email, applicantId: applicant.id });
    res.json({ ok: true, token, applicant });
  } catch {
    res.status(500).json({ error: 'failed to login student' });
  }
});

router.get('/me', requireStudentAuth, async (req, res) => {
  try {
    const applicant = await getStudentProfileByUserId(req.auth.userId);
    if (!applicant) {
      res.status(404).json({ error: 'student profile not found' });
      return;
    }

    res.json({ applicant });
  } catch {
    res.status(500).json({ error: 'failed to load student profile' });
  }
});

export default router;
