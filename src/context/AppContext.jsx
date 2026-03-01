import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { APP_STATUSES, DOC_TYPES } from '../types';

const AppContext = createContext(null);
const STUDENT_TOKEN_KEY = 'studentAuthToken';

function normalizeApplicant(applicant) {
  const normalizedDocuments = DOC_TYPES.reduce((acc, doc) => {
    acc[doc] = applicant.documents?.[doc] ?? 'Action Required';
    return acc;
  }, {});

  const nameParts = String(applicant.fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const firstName = applicant.firstName || nameParts[0] || '';
  const lastName = applicant.lastName || nameParts.slice(1).join(' ') || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || applicant.fullName || '';
  const normalizedOpportunityTypes = (applicant.opportunityTypes || []).map((type) =>
    type === 'Hands On' ? 'Hands-On Experience' : type
  );

  return {
    id: applicant.id,
    firstName,
    lastName,
    fullName,
    email: applicant.email,
    country: applicant.country,
    phone: applicant.phone || '',
    birthDate: applicant.birthDate || '',
    countryOfBirth: applicant.countryOfBirth || '',
    gender: applicant.gender || '',
    passportIssuingCountry: applicant.passportIssuingCountry || '',
    usStatus: applicant.usStatus || 'None',
    medicalSchool: applicant.medicalSchool,
    medicalSchoolCountry: applicant.medicalSchoolCountry || '',
    academicStatus: applicant.academicStatus || '',
    graduationYear: Number(applicant.graduationYear),
    step1Score: applicant.step1Score === 'Fail' ? 'Fail' : 'Pass',
    step2Score: applicant.step2Score === '' || applicant.step2Score == null ? null : Number(applicant.step2Score),
    step3Score: applicant.step3Score === '' || applicant.step3Score == null ? null : Number(applicant.step3Score),
    preferredMonths: applicant.preferredMonths || [],
    opportunityTypes: normalizedOpportunityTypes,
    setupPreference: applicant.setupPreference || 'Clinic',
    specialtyPreference: applicant.specialtyPreference || '',
    accommodationNeeded: applicant.accommodationNeeded || 'No',
    status: APP_STATUSES.includes(applicant.status) ? applicant.status : 'Submitted',
    visaConfirmed: Boolean(applicant.visaConfirmed),
    travelConfirmed: Boolean(applicant.travelConfirmed),
    documents: normalizedDocuments,
    uploads: applicant.uploads || {}
  };
}

export function AppProvider({ children }) {
  const [applicants, setApplicants] = useState([]);
  const [currentStudentId, setCurrentStudentId] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentToken, setStudentToken] = useState(() => localStorage.getItem(STUDENT_TOKEN_KEY) || '');
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [mailLog, setMailLog] = useState([]);

  function storeStudentToken(token) {
    if (token) {
      localStorage.setItem(STUDENT_TOKEN_KEY, token);
      setStudentToken(token);
      return;
    }

    localStorage.removeItem(STUDENT_TOKEN_KEY);
    setStudentToken('');
  }

  function clearStudentSession() {
    storeStudentToken('');
    setStudentProfile(null);
  }

  useEffect(() => {
    async function loadApplicants() {
      try {
        const response = await fetch('/api/applicants');
        if (!response.ok) throw new Error('API unavailable');
        const data = await response.json();
        if (Array.isArray(data?.applicants)) {
          const normalized = data.applicants.map(normalizeApplicant);
          setApplicants(normalized);
          setCurrentStudentId(normalized[0]?.id || '');
        }
      } catch {
        setApplicants([]);
        setCurrentStudentId('');
      }
    }

    loadApplicants();
  }, []);

  useEffect(() => {
    async function loadStudentProfile() {
      if (!studentToken) {
        setStudentProfile(null);
        return;
      }

      try {
        const response = await fetch('/api/student/me', {
          headers: {
            Authorization: `Bearer ${studentToken}`
          }
        });

        if (!response.ok) {
          clearStudentSession();
          return;
        }

        const data = await response.json();
        if (data?.applicant) {
          const normalized = normalizeApplicant(data.applicant);
          setStudentProfile(normalized);
          setCurrentStudentId(normalized.id);
        }
      } catch {
        clearStudentSession();
      }
    }

    loadStudentProfile();
  }, [studentToken]);

  const currentStudent = useMemo(
    () => studentProfile || applicants.find((item) => item.id === currentStudentId) || applicants[0] || null,
    [applicants, currentStudentId, studentProfile]
  );

  async function addApplicant(formData) {
    const payload = {
      ...formData,
      status: 'Submitted',
      documents: {
        CV: 'Action Required',
        'Passport Bio': 'Action Required',
        'Step Score Report': 'Action Required',
        'Immunization Records': 'Action Required'
      }
    };

    const response = await fetch('/api/applicants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || 'Failed to create applicant');
    }

    const data = await response.json();
    const newApplicant = normalizeApplicant(data.applicant);

    setApplicants((prev) => [newApplicant, ...prev]);
    setCurrentStudentId(newApplicant.id);

    if (data?.token) {
      storeStudentToken(data.token);
      setStudentProfile(newApplicant);
    }

    return newApplicant;
  }

  async function studentLogin(email, password) {
    const response = await fetch('/api/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || 'Failed to login');
    }

    const data = await response.json();
    const normalized = normalizeApplicant(data.applicant);
    storeStudentToken(data.token);
    setStudentProfile(normalized);
    setCurrentStudentId(normalized.id);
    setApplicants((prev) => {
      const existing = prev.some((item) => item.id === normalized.id);
      if (existing) {
        return prev.map((item) => (item.id === normalized.id ? normalized : item));
      }

      return [normalized, ...prev];
    });

    return normalized;
  }

  function studentLogout() {
    clearStudentSession();
  }

  async function updateDocumentStatus(applicantId, docType, status) {
    const response = await fetch(`/api/applicants/${applicantId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docType, status })
    });

    if (!response.ok) {
      throw new Error('Failed to update document status');
    }

    const data = await response.json();
    const updatedApplicant = normalizeApplicant(data.applicant);

    setApplicants((prev) => prev.map((applicant) => (applicant.id === applicantId ? updatedApplicant : applicant)));
    if (studentProfile?.id === applicantId) {
      setStudentProfile(updatedApplicant);
    }
    return updatedApplicant;
  }

  async function setApplicantStatus(applicantId, status) {
    if (!APP_STATUSES.includes(status)) return;
    const response = await fetch(`/api/applicants/${applicantId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update applicant status');
    }

    const data = await response.json();
    const updatedApplicant = normalizeApplicant(data.applicant);

    setApplicants((prev) => prev.map((applicant) => (applicant.id === applicantId ? updatedApplicant : applicant)));
    if (studentProfile?.id === applicantId) {
      setStudentProfile(updatedApplicant);
    }

    const target = applicants.find((applicant) => applicant.id === applicantId);
    const message = {
      at: new Date().toISOString(),
      applicantId,
      to: target?.email || updatedApplicant.email || 'unknown@email.com',
      subject: `USCE Application Status Update: ${status}`,
      body: `Hello ${target?.fullName || updatedApplicant.fullName || 'Applicant'}, your application is now ${status}.`
    };

    setMailLog((prev) => [message, ...prev]);
    return updatedApplicant;
  }

  async function uploadDocument(applicantId, docType, fileName) {
    const response = await fetch(`/api/applicants/${applicantId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docType,
        status: 'Verified',
        upload: {
          fileName,
          url: null
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to upload document metadata');
    }

    const data = await response.json();
    const updatedApplicant = normalizeApplicant(data.applicant);
    setApplicants((prev) => prev.map((applicant) => (applicant.id === applicantId ? updatedApplicant : applicant)));
    if (studentProfile?.id === applicantId) {
      setStudentProfile(updatedApplicant);
    }
    return updatedApplicant;
  }

  const value = {
    applicants,
    currentStudent,
    studentAuthenticated: Boolean(studentToken && studentProfile),
    setCurrentStudentId,
    addApplicant,
    studentLogin,
    studentLogout,
    uploadDocument,
    updateDocumentStatus,
    setApplicantStatus,
    adminAuthenticated,
    setAdminAuthenticated,
    mailLog,
    statuses: APP_STATUSES
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
