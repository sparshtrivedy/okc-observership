import { Router } from 'express';
import {
  createApplicant,
  getApplicantById,
  listApplicants,
  updateApplicantDocument,
  updateApplicantStatus
} from '../services/applicantService.js';
import { signStudentToken } from '../auth/token.js';
import { requireAdminAuth } from '../middleware/requireAdminAuth.js';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  buildApplicantDocumentKey,
  createDocumentDownloadUrl,
  createDocumentUploadUrl,
  isS3Configured
} from '../services/s3Service.js';

const router = Router();

function hasApplicantAccess(req, applicantId) {
  if (req.auth.role === 'admin') return true;
  if (req.auth.role === 'student') return req.auth.applicantId === applicantId;
  return false;
}

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

router.post('/:applicantId/documents/presign-upload', requireAuth, async (req, res) => {
  const { applicantId } = req.params;
  const { docType, fileName, contentType } = req.body || {};

  if (!hasApplicantAccess(req, applicantId)) {
    res.status(403).json({ error: 'unauthorized' });
    return;
  }

  if (!isS3Configured()) {
    res.status(500).json({ error: 'S3 is not configured on the server' });
    return;
  }

  if (!docType || !fileName) {
    res.status(400).json({ error: 'docType and fileName are required' });
    return;
  }

  try {
    const key = buildApplicantDocumentKey(applicantId, docType, fileName);
    const uploadUrl = await createDocumentUploadUrl({ key, contentType });
    res.json({ uploadUrl, key, expiresIn: 120 });
  } catch {
    res.status(500).json({ error: 'failed to create upload URL' });
  }
});

router.get('/:applicantId/documents/presign-download', requireAuth, async (req, res) => {
  const { applicantId } = req.params;
  const docType = req.query.docType;

  if (!hasApplicantAccess(req, applicantId)) {
    res.status(403).json({ error: 'unauthorized' });
    return;
  }

  if (!docType) {
    res.status(400).json({ error: 'docType is required' });
    return;
  }

  try {
    const applicant = await getApplicantById(applicantId);
    if (!applicant) {
      res.status(404).json({ error: 'applicant not found' });
      return;
    }

    const upload = applicant.uploads?.[docType];
    if (!upload) {
      res.status(404).json({ error: 'document not found' });
      return;
    }

    if (upload.url && !upload.key) {
      res.json({ downloadUrl: upload.url, external: true });
      return;
    }

    if (!isS3Configured()) {
      res.status(500).json({ error: 'S3 is not configured on the server' });
      return;
    }

    if (!upload.key) {
      res.status(404).json({ error: 'document key not found' });
      return;
    }

    const downloadUrl = await createDocumentDownloadUrl({ key: upload.key });
    res.json({ downloadUrl, expiresIn: 300 });
  } catch {
    res.status(500).json({ error: 'failed to create download URL' });
  }
});

export default router;
