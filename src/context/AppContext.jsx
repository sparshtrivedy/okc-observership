import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { starterApplicants } from '../data/mockData';
import { APP_STATUSES, DOC_TYPES } from '../types';

const AppContext = createContext(null);

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
  const [applicants, setApplicants] = useState(starterApplicants.map(normalizeApplicant));
  const [currentStudentId, setCurrentStudentId] = useState(starterApplicants[0].id);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [mailLog, setMailLog] = useState([]);

  useEffect(() => {
    async function loadApplicants() {
      try {
        const response = await fetch('/api/applicants');
        if (!response.ok) throw new Error('API unavailable');
        const data = await response.json();
        if (Array.isArray(data?.applicants) && data.applicants.length > 0) {
          setApplicants(data.applicants.map(normalizeApplicant));
          setCurrentStudentId(data.applicants[0].id);
        }
      } catch {
        // Falls back to local mock data.
      }
    }

    loadApplicants();
  }, []);

  const currentStudent = useMemo(
    () => applicants.find((item) => item.id === currentStudentId) || applicants[0],
    [applicants, currentStudentId]
  );

  function addApplicant(formData) {
    const newApplicant = normalizeApplicant({
      ...formData,
      id: `A-${Date.now().toString().slice(-6)}`,
      status: 'Submitted',
      documents: {
        CV: 'Action Required',
        'Passport Bio': 'Action Required',
        'Step Score Report': 'Action Required',
        'Immunization Records': 'Action Required'
      }
    });

    setApplicants((prev) => [newApplicant, ...prev]);
    setCurrentStudentId(newApplicant.id);
    return newApplicant;
  }

  function updateDocumentStatus(applicantId, docType, status) {
    setApplicants((prev) =>
      prev.map((applicant) =>
        applicant.id === applicantId
          ? {
              ...applicant,
              documents: {
                ...applicant.documents,
                [docType]: status
              }
            }
          : applicant
      )
    );
  }

  function setApplicantStatus(applicantId, status) {
    if (!APP_STATUSES.includes(status)) return;
    setApplicants((prev) => prev.map((applicant) => (applicant.id === applicantId ? { ...applicant, status } : applicant)));

    const target = applicants.find((applicant) => applicant.id === applicantId);
    const message = {
      at: new Date().toISOString(),
      applicantId,
      to: target?.email || 'unknown@email.com',
      subject: `USCE Application Status Update: ${status}`,
      body: `Hello ${target?.fullName || 'Applicant'}, your application is now ${status}.`
    };

    setMailLog((prev) => [message, ...prev]);

    fetch(`/api/applicants/${applicantId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(() => {});
  }

  function uploadDocument(applicantId, docType, fileName) {
    setApplicants((prev) =>
      prev.map((applicant) =>
        applicant.id === applicantId
          ? {
              ...applicant,
              documents: {
                ...applicant.documents,
                [docType]: 'Verified'
              },
              uploads: {
                ...applicant.uploads,
                [docType]: {
                  fileName,
                  url: `/mock-files/${encodeURIComponent(fileName)}`
                }
              }
            }
          : applicant
      )
    );
  }

  const value = {
    applicants,
    currentStudent,
    setCurrentStudentId,
    addApplicant,
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
