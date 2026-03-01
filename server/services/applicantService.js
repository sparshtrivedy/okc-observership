import bcrypt from 'bcryptjs';
import { db } from '../db/client.js';
import { dbPool } from '../db/client.js';

function mapApplicantRow(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: `${row.first_name} ${row.last_name}`.trim(),
    email: row.email,
    userId: row.user_id ?? null,
    phone: row.phone,
    birthDate: row.birth_date,
    countryOfBirth: row.country_of_birth,
    gender: row.gender,
    country: row.country,
    passportIssuingCountry: row.passport_issuing_country,
    usStatus: row.us_status,
    medicalSchool: row.medical_school,
    medicalSchoolCountry: row.medical_school_country,
    academicStatus: row.academic_status,
    graduationYear: row.graduation_year,
    step1Score: row.step1_result,
    step2Score: row.step2_score,
    step3Score: row.step3_score,
    preferredMonths: row.preferred_months || [],
    opportunityTypes: row.opportunity_types || [],
    setupPreference: row.setup_preference,
    specialtyPreference: row.specialty_preference,
    accommodationNeeded: row.accommodation_needed,
    status: row.status,
    visaConfirmed: row.visa_confirmed,
    travelConfirmed: row.travel_confirmed,
    documents: row.documents || {},
    uploads: row.uploads || {}
  };
}

function generateApplicantId() {
  return `A-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
}

export async function listApplicants() {
  const result = await db.query('SELECT * FROM applicants ORDER BY created_at DESC');
  return result.rows.map(mapApplicantRow);
}

export async function createApplicant(input) {
  const id = input.id || generateApplicantId();
  const client = await dbPool.connect();

  try {
    await client.query('BEGIN');

    let userId = null;
    if (input.password) {
      const passwordHash = await bcrypt.hash(input.password, 10);
      const userResult = await client.query(
        `
          INSERT INTO users (email, password_hash, role)
          VALUES ($1, $2, 'student')
          RETURNING id
        `,
        [input.email, passwordHash]
      );
      userId = userResult.rows[0].id;
    }

    const result = await client.query(
      `
        INSERT INTO applicants (
          id, first_name, last_name, email, phone, birth_date, country_of_birth, gender,
          country, passport_issuing_country, us_status, medical_school, medical_school_country,
          academic_status, graduation_year, step1_result, step2_score, step3_score,
          preferred_months, opportunity_types, setup_preference, specialty_preference,
          accommodation_needed, status, visa_confirmed, travel_confirmed, user_id, documents, uploads
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22,
          $23, $24, $25, $26, $27, $28::jsonb, $29::jsonb
        )
        RETURNING *
      `,
      [
        id,
        input.firstName,
        input.lastName,
        input.email,
        input.phone,
        input.birthDate,
        input.countryOfBirth,
        input.gender,
        input.country,
        input.passportIssuingCountry,
        input.usStatus,
        input.medicalSchool,
        input.medicalSchoolCountry,
        input.academicStatus,
        Number(input.graduationYear),
        input.step1Score,
        input.step2Score === '' || input.step2Score == null ? null : Number(input.step2Score),
        input.step3Score === '' || input.step3Score == null ? null : Number(input.step3Score),
        input.preferredMonths || [],
        (input.opportunityTypes || []).map((type) => (type === 'Hands On' ? 'Hands-On Experience' : type)),
        input.setupPreference,
        input.specialtyPreference || '',
        input.accommodationNeeded,
        input.status || 'Submitted',
        Boolean(input.visaConfirmed ?? true),
        Boolean(input.travelConfirmed ?? true),
        userId,
        JSON.stringify(
          input.documents || {
            CV: 'Action Required',
            'Passport Bio': 'Action Required',
            'Step Score Report': 'Action Required',
            'Immunization Records': 'Action Required'
          }
        ),
        JSON.stringify(input.uploads || {})
      ]
    );

    await client.query('COMMIT');
    return mapApplicantRow(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getApplicantByUserId(userId) {
  const result = await db.query('SELECT * FROM applicants WHERE user_id = $1 LIMIT 1', [userId]);
  if (result.rowCount === 0) return null;
  return mapApplicantRow(result.rows[0]);
}

export async function updateApplicantStatus(applicantId, status, changedByUserId = null) {
  const existing = await db.query('SELECT * FROM applicants WHERE id = $1', [applicantId]);
  if (existing.rowCount === 0) return null;

  const oldStatus = existing.rows[0].status;

  const updated = await db.query(
    'UPDATE applicants SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
    [applicantId, status]
  );

  await db.query(
    `
      INSERT INTO status_history (applicant_id, old_status, new_status, changed_by_user_id)
      VALUES ($1, $2, $3, $4)
    `,
    [applicantId, oldStatus, status, changedByUserId]
  );

  return mapApplicantRow(updated.rows[0]);
}

export async function updateApplicantDocument(applicantId, docType, { status, upload } = {}) {
  const existing = await db.query('SELECT * FROM applicants WHERE id = $1', [applicantId]);
  if (existing.rowCount === 0) return null;

  const row = existing.rows[0];
  const documents = { ...(row.documents || {}) };
  const uploads = { ...(row.uploads || {}) };

  if (status) {
    documents[docType] = status;
  }

  if (upload && upload.fileName) {
    uploads[docType] = {
      fileName: upload.fileName,
      url: upload.url ?? null
    };
  }

  const updated = await db.query(
    'UPDATE applicants SET documents = $2::jsonb, uploads = $3::jsonb, updated_at = NOW() WHERE id = $1 RETURNING *',
    [applicantId, JSON.stringify(documents), JSON.stringify(uploads)]
  );

  return mapApplicantRow(updated.rows[0]);
}
