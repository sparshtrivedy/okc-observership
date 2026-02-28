import { starterApplicants } from '../../src/data/mockData.js';

let applicants = [...starterApplicants];

export function listApplicants() {
  return applicants;
}

export function updateApplicantStatus(applicantId, status) {
  applicants = applicants.map((applicant) => (applicant.id === applicantId ? { ...applicant, status } : applicant));
  return applicants.find((applicant) => applicant.id === applicantId);
}
