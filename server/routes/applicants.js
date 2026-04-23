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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/;
const REQUIRED_DOC_TYPES = ['CV', 'Passport Bio', 'Step Score Report', 'Immunization Records'];
const ALLOWED_DOC_TYPES = new Set(REQUIRED_DOC_TYPES);
const ALLOWED_UPLOAD_CONTENT_TYPES = new Set(['application/pdf']);
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function isValidDateString(value) {
  if (isBlank(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isValidOptionalScore(value) {
  if (value === '' || value == null) return true;
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 300;
}

function validateApplicantPayload(payload) {
  const errors = {};
  const currentYear = new Date().getFullYear();
  const graduationYear = Number(payload.graduationYear);

  const requiredFields = {
    firstName: 'First name is required.',
    lastName: 'Last name is required.',
    email: 'Email is required.',
    password: 'Password is required.',
    phone: 'Phone number is required.',
    birthDate: 'Birth date is required.',
    countryOfBirth: 'Country of birth is required.',
    gender: 'Gender is required.',
    country: 'Country is required.',
    passportIssuingCountry: 'Passport issuing country is required.',
    medicalSchool: 'Medical school is required.',
    medicalSchoolCountry: 'Medical school country is required.',
    academicStatus: 'Academic status is required.',
    graduationYear: 'Graduation year is required.',
    step1Score: 'USMLE Step 1 result is required.',
    step1Completed: 'Completed Step 1 selection is required.',
    step2Completed: 'Completed Step 2 selection is required.',
    step3Completed: 'Completed Step 3 selection is required.',
    usStatus: 'Immigration status is required.',
    setupPreference: 'Setting preference is required.',
    priorUsRotation: 'Prior US rotation selection is required.',
    rotationLocation: 'Rotation location is required.',
    rotationDuration: 'Rotation duration is required.',
    specialtyPreference: 'Subspecialty interest is required.',
    accommodationNeeded: 'Accommodation selection is required.'
  };

  for (const [field, message] of Object.entries(requiredFields)) {
    if (isBlank(payload[field])) {
      errors[field] = message;
    }
  }

  if (!isBlank(payload.email) && !EMAIL_REGEX.test(String(payload.email).trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!isBlank(payload.password) && String(payload.password).length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!isBlank(payload.phone) && !PHONE_REGEX.test(String(payload.phone).trim())) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!isBlank(payload.birthDate) && !isValidDateString(payload.birthDate)) {
    errors.birthDate = 'Enter a valid birth date.';
  }

  if (!isBlank(payload.graduationYear) && (!Number.isFinite(graduationYear) || graduationYear < 1950 || graduationYear > currentYear + 10)) {
    errors.graduationYear = `Graduation year must be between 1950 and ${currentYear + 10}.`;
  }

  if (!isValidOptionalScore(payload.step2Score)) {
    errors.step2Score = 'Step 2 score must be a number between 0 and 300.';
  }

  if (!isValidOptionalScore(payload.step3Score)) {
    errors.step3Score = 'Step 3 score must be a number between 0 and 300.';
  }

  if (!Array.isArray(payload.preferredMonths) || payload.preferredMonths.length === 0) {
    errors.preferredMonths = 'At least one preferred month is required.';
  }

  if (!Array.isArray(payload.opportunityTypes) || payload.opportunityTypes.length === 0) {
    errors.opportunityTypes = 'Select at least one rotation goal.';
  }

  if (!Array.isArray(payload.practiceEnvironment) || payload.practiceEnvironment.length === 0) {
    errors.practiceEnvironment = 'Select at least one practice environment item.';
  }

  return errors;
}

function validateDocType(docType) {
  if (!docType) return 'docType is required';
  if (!ALLOWED_DOC_TYPES.has(docType)) {
    return `invalid docType. Allowed values: ${REQUIRED_DOC_TYPES.join(', ')}`;
  }
  return '';
}

function isValidUploadFileName(fileName) {
  if (typeof fileName !== 'string' || fileName.trim() === '') return false;
  return fileName.toLowerCase().endsWith('.pdf');
}

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

router.get('/required-documents', (_req, res) => {
  res.json({
    requiredDocuments: REQUIRED_DOC_TYPES,
    allowedContentTypes: Array.from(ALLOWED_UPLOAD_CONTENT_TYPES),
    maxUploadSizeBytes: MAX_UPLOAD_SIZE_BYTES
  });
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    const validationErrors = validateApplicantPayload(payload);
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({ error: 'validation failed', fieldErrors: validationErrors });
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

  const docTypeError = validateDocType(docType);
  if (docTypeError) {
    res.status(400).json({ error: docTypeError });
    return;
  }

  if (upload) {
    if (!isValidUploadFileName(upload.fileName)) {
      res.status(400).json({ error: 'fileName is required and must end in .pdf' });
      return;
    }

    if (!ALLOWED_UPLOAD_CONTENT_TYPES.has(upload.contentType || '')) {
      res.status(400).json({ error: 'only PDF uploads are allowed' });
      return;
    }

    if (upload.size != null) {
      const size = Number(upload.size);
      if (!Number.isFinite(size) || size <= 0 || size > MAX_UPLOAD_SIZE_BYTES) {
        res.status(400).json({ error: `file size must be between 1 byte and ${MAX_UPLOAD_SIZE_BYTES} bytes` });
        return;
      }
    }

    if (typeof upload.key !== 'string' || upload.key.trim() === '') {
      res.status(400).json({ error: 'upload key is required' });
      return;
    }
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
  const { docType, fileName, contentType, fileSize } = req.body || {};

  if (!hasApplicantAccess(req, applicantId)) {
    res.status(403).json({ error: 'unauthorized' });
    return;
  }

  if (!isS3Configured()) {
    res.status(500).json({ error: 'S3 is not configured on the server' });
    return;
  }

  const docTypeError = validateDocType(docType);
  if (docTypeError) {
    res.status(400).json({ error: docTypeError });
    return;
  }

  if (!isValidUploadFileName(fileName)) {
    res.status(400).json({ error: 'fileName is required and must end in .pdf' });
    return;
  }

  if (!ALLOWED_UPLOAD_CONTENT_TYPES.has(contentType || '')) {
    res.status(400).json({ error: 'only PDF uploads are allowed' });
    return;
  }

  if (fileSize != null) {
    const size = Number(fileSize);
    if (!Number.isFinite(size) || size <= 0 || size > MAX_UPLOAD_SIZE_BYTES) {
      res.status(400).json({ error: `file size must be between 1 byte and ${MAX_UPLOAD_SIZE_BYTES} bytes` });
      return;
    }
  }

  if (!fileName) {
    res.status(400).json({ error: 'fileName is required' });
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

  const docTypeError = validateDocType(docType);
  if (docTypeError) {
    res.status(400).json({ error: docTypeError });
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
