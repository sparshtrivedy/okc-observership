import { Router } from 'express';
import { listApplicants, updateApplicantStatus } from '../services/applicantService.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ applicants: listApplicants() });
});

router.post('/:applicantId/status', (req, res) => {
  const { applicantId } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: 'status is required' });
    return;
  }

  const updated = updateApplicantStatus(applicantId, status);
  if (!updated) {
    res.status(404).json({ error: 'applicant not found' });
    return;
  }

  res.json({ applicant: updated, notification: `Mock email sent for ${updated.fullName}` });
});

export default router;
