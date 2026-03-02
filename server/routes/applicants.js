import { Router } from 'express';
import { createApplicant, listApplicants, updateApplicantDocument, updateApplicantStatus } from '../services/applicantService.js';
import { signStudentToken } from '../auth/token.js';
import { requireAdminAuth } from '../middleware/requireAdminAuth.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', requireAdminAuth, async (_req, res) => {
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
    if (!payload.firstName || !payload.lastName || !payload.email || !payload.password) {
      res.status(400).json({ error: 'firstName, lastName, email, and password are required' });
      return;
    }

    if (String(payload.password).length < 8) {
      res.status(400).json({ error: 'password must be at least 8 characters' });
      return;
    }

    const applicant = await createApplicant(payload);
    const token = applicant.userId
      ? signStudentToken({ userId: applicant.userId, email: applicant.email, applicantId: applicant.id })
      : null;

    res.status(201).json({ applicant, token });
  } catch (error) {
    if (String(error.message).toLowerCase().includes('duplicate') || String(error.message).includes('unique')) {
      res.status(409).json({ error: 'applicant with this email already exists' });
      return;
    }
    res.status(500).json({ error: 'failed to create applicant' });
  }
});

router.post('/:applicantId/status', requireAdminAuth, async (req, res) => {
  const { applicantId } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: 'status is required' });
    return;
  }

  try {
    const updated = await updateApplicantStatus(applicantId, status, req.auth.userId);
    if (!updated) {
      res.status(404).json({ error: 'applicant not found' });
      return;
    }

    res.json({ applicant: updated, notification: `Status update sent for ${updated.fullName}` });
  } catch (error) {
    res.status(500).json({ error: 'failed to update applicant status' });
  }
});

router.post('/:applicantId/documents', requireAuth, async (req, res) => {
  const { applicantId } = req.params;
  const { docType, status, upload } = req.body || {};

  if (!docType) {
    res.status(400).json({ error: 'docType is required' });
    return;
  }

  try {
    let payload = { status, upload };

    if (req.auth.role === 'student') {
      if (req.auth.applicantId !== applicantId) {
        res.status(403).json({ error: 'students can only update their own documents' });
        return;
      }

      payload = {
        upload,
        status: null,
        allowOverwrite: false
      };
    } else if (req.auth.role !== 'admin') {
      res.status(403).json({ error: 'unauthorized role' });
      return;
    }

    const updated = await updateApplicantDocument(applicantId, docType, payload);
    if (!updated) {
      res.status(404).json({ error: 'applicant not found' });
      return;
    }

    res.json({ applicant: updated });
  } catch (error) {
    if (String(error.message).toLowerCase().includes('already submitted')) {
      res.status(409).json({ error: 'document already submitted and cannot be changed' });
      return;
    }

    res.status(500).json({ error: 'failed to update applicant documents' });
  }
});

export default router;
