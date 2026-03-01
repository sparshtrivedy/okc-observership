import { Router } from 'express';
import { createApplicant, listApplicants, updateApplicantDocument, updateApplicantStatus } from '../services/applicantService.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const applicants = await listApplicants();
    res.json({ applicants });
  } catch (error) {
    res.status(500).json({ error: 'failed to load applicants' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.firstName || !payload.lastName || !payload.email) {
      res.status(400).json({ error: 'firstName, lastName, and email are required' });
      return;
    }

    const applicant = await createApplicant(payload);
    res.status(201).json({ applicant });
  } catch (error) {
    if (String(error.message).toLowerCase().includes('duplicate') || String(error.message).includes('unique')) {
      res.status(409).json({ error: 'applicant with this email already exists' });
      return;
    }
    res.status(500).json({ error: 'failed to create applicant' });
  }
});

router.post('/:applicantId/status', async (req, res) => {
  const { applicantId } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: 'status is required' });
    return;
  }

  try {
    const updated = await updateApplicantStatus(applicantId, status, null);
    if (!updated) {
      res.status(404).json({ error: 'applicant not found' });
      return;
    }

    res.json({ applicant: updated, notification: `Status update sent for ${updated.fullName}` });
  } catch (error) {
    res.status(500).json({ error: 'failed to update applicant status' });
  }
});

router.post('/:applicantId/documents', async (req, res) => {
  const { applicantId } = req.params;
  const { docType, status, upload } = req.body || {};

  if (!docType) {
    res.status(400).json({ error: 'docType is required' });
    return;
  }

  try {
    const updated = await updateApplicantDocument(applicantId, docType, { status, upload });
    if (!updated) {
      res.status(404).json({ error: 'applicant not found' });
      return;
    }

    res.json({ applicant: updated });
  } catch (error) {
    res.status(500).json({ error: 'failed to update applicant documents' });
  }
});

export default router;
