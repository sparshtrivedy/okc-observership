import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import GatekeeperModal from '../components/forms/GatekeeperModal';
import DocumentDropzone from '../components/forms/DocumentDropzone';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label, Select } from '../components/ui/form-controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DOC_TYPES } from '../types';

const monthOptions = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026'
];
const opportunityOptions = ['Hands on experience', 'Research publication', 'Research presentation at conference', 'LOR'];
const usStatusOptions = ['Valid tourist visa', 'Will apply for tourist visa', 'On student visa', 'Permanent resident/US citizen'];
const setupOptions = ['Clinic', 'Hospital', 'Both'];
const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const academicStatusOptions = [
  'Currently in medical school',
  'Completed medical school',
  'Pursuing residency training',
  'Pursuing research in US'
];
const priorUsRotationOptions = ['Yes', 'No', 'Once', 'More than once'];
const practiceEnvironmentOptions = [
  'Experience with EMR',
  'Ability to talk to patients',
  'Ability to review test results',
  'Opportunity to observe procedures',
  'Ability to enter notes in EMR',
  'Opportunity to engage with other residents/medical students',
  'Participate in didactic discussions'
];
const usmleCompletionOptions = ['Completed', 'Not completed'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/;
const REQUIRED_DOCUMENTS = DOC_TYPES;
const ALLOWED_FILE_TYPES = ['application/pdf'];
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

function isBlank(value) {
  return typeof value !== 'string' || value.trim() === '';
}

function isValidDateString(value) {
  if (isBlank(value)) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function validateApplyForm(form) {
  const errors = {};
  const currentYear = new Date().getFullYear();

  const requiredFields = {
    firstName: 'First name is required.',
    lastName: 'Last name is required.',
    email: 'Email is required.',
    password: 'Password is required.',
    confirmPassword: 'Please confirm your password.',
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
    priorUsRotation: 'Prior US rotation is required.',
    rotationLocation: 'Location is required.',
    rotationDuration: 'Duration is required.',
    specialtyPreference: 'Subspecialty interest is required.',
    accommodationNeeded: 'Accommodation selection is required.'
  };

  for (const [field, message] of Object.entries(requiredFields)) {
    if (isBlank(form[field])) {
      errors[field] = message;
    }
  }

  if (!isBlank(form.email) && !EMAIL_REGEX.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!isBlank(form.password) && form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!isBlank(form.confirmPassword) && form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Password confirmation does not match.';
  }

  if (!isBlank(form.phone) && !PHONE_REGEX.test(form.phone.trim())) {
    errors.phone = 'Enter a valid phone number.';
  }

  if (!isBlank(form.birthDate) && !isValidDateString(form.birthDate)) {
    errors.birthDate = 'Enter a valid birth date.';
  }

  if (!isBlank(form.graduationYear)) {
    const graduationYear = Number(form.graduationYear);
    if (!Number.isFinite(graduationYear) || graduationYear < 1950 || graduationYear > currentYear + 10) {
      errors.graduationYear = `Graduation year must be between 1950 and ${currentYear + 10}.`;
    }
  }

  if (form.step2Score !== '' && form.step2Score != null) {
    const step2 = Number(form.step2Score);
    if (!Number.isFinite(step2) || step2 < 0 || step2 > 300) {
      errors.step2Score = 'Step 2 score must be between 0 and 300.';
    }
  }

  if (form.step3Score !== '' && form.step3Score != null) {
    const step3 = Number(form.step3Score);
    if (!Number.isFinite(step3) || step3 < 0 || step3 > 300) {
      errors.step3Score = 'Step 3 score must be between 0 and 300.';
    }
  }

  if (!Array.isArray(form.preferredMonths) || form.preferredMonths.length === 0) {
    errors.preferredMonths = 'Select at least one preferred month.';
  }

  if (!Array.isArray(form.opportunityTypes) || form.opportunityTypes.length === 0) {
    errors.opportunityTypes = 'Select at least one rotation goal.';
  }

  if (!Array.isArray(form.practiceEnvironment) || form.practiceEnvironment.length === 0) {
    errors.practiceEnvironment = 'Select at least one practice environment option.';
  }

  return errors;
}

function validateDocumentFile(file) {
  if (!file) return 'File is required.';

  const fileName = String(file.name || '').toLowerCase();
  const fileType = String(file.type || '').toLowerCase();
  const fileSize = Number(file.size || 0);

  if (!fileName.endsWith('.pdf')) {
    return 'Only PDF files are allowed.';
  }

  if (!ALLOWED_FILE_TYPES.includes(fileType)) {
    return 'Only PDF files are allowed.';
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_UPLOAD_SIZE_BYTES) {
    return 'File must be between 1 byte and 5 MB.';
  }

  return '';
}

export default function ApplyPage() {
  const navigate = useNavigate();
  const { addApplicant, uploadDocument } = useApp();
  const [eligible, setEligible] = useState(false);
  const [currentStep, setCurrentStep] = useState('step1');
  const [files, setFiles] = useState({});
  const [documentErrors, setDocumentErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [monthRangeStart, setMonthRangeStart] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
    countryOfBirth: '',
    gender: '',
    country: '',
    passportIssuingCountry: '',
    medicalSchool: '',
    medicalSchoolCountry: '',
    academicStatus: '',
    graduationYear: '',
    step1Score: '',
    step2Score: '',
    step3Score: '',
    step1Completed: '',
    step2Completed: '',
    step3Completed: '',
    usStatus: '',
    preferredMonths: [],
    opportunityTypes: [],
    setupPreference: '',
    priorUsRotation: '',
    rotationLocation: '',
    rotationDuration: '',
    practiceEnvironment: [],
    specialtyPreference: '',
    accommodationNeeded: '',
    visaConfirmed: true,
    travelConfirmed: true
  });

  const canSubmit = useMemo(() => {
    const hasValidForm = Object.keys(validateApplyForm(form)).length === 0;
    const requiredDocsPresent = REQUIRED_DOCUMENTS.every((docType) => Boolean(files[docType]));
    const hasDocumentErrors = Object.values(documentErrors).some(Boolean);
    return hasValidForm && requiredDocsPresent && !hasDocumentErrors;
  }, [documentErrors, files, form]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleDocumentSelected(docType, file) {
    const fileError = validateDocumentFile(file);
    if (fileError) {
      setFiles((prev) => {
        if (!prev[docType]) return prev;
        const next = { ...prev };
        delete next[docType];
        return next;
      });
      setDocumentErrors((prev) => ({ ...prev, [docType]: fileError }));
      return;
    }

    setFiles((prev) => ({ ...prev, [docType]: file }));
    setDocumentErrors((prev) => {
      if (!prev[docType]) return prev;
      const next = { ...prev };
      delete next[docType];
      return next;
    });
    setFieldErrors((prev) => {
      if (!prev.documents) return prev;
      const next = { ...prev };
      delete next.documents;
      return next;
    });
  }

  const selectedMonthsSet = new Set(form.preferredMonths);

  function buildConsecutiveRange(startIndex, endIndex) {
    const totalMonths = monthOptions.length;
    const forwardDistance = (endIndex - startIndex + totalMonths) % totalMonths;
    const backwardDistance = (startIndex - endIndex + totalMonths) % totalMonths;

    if (forwardDistance <= 2) {
      return Array.from({ length: forwardDistance + 1 }, (_, index) => (startIndex + index) % totalMonths);
    }

    if (backwardDistance <= 2) {
      return Array.from({ length: backwardDistance + 1 }, (_, index) => (startIndex - index + totalMonths) % totalMonths);
    }

    return null;
  }

  function handleMonthTileClick(monthIndex) {
    if (monthRangeStart === null) {
      setMonthRangeStart(monthIndex);
      setForm((prev) => ({ ...prev, preferredMonths: [monthOptions[monthIndex]] }));
      return;
    }

    if (monthIndex === monthRangeStart) {
      setForm((prev) => ({ ...prev, preferredMonths: [monthOptions[monthIndex]] }));
      setMonthRangeStart(null);
      return;
    }

    const rangeIndices = buildConsecutiveRange(monthRangeStart, monthIndex);

    if (!rangeIndices) {
      setMonthRangeStart(monthIndex);
      setForm((prev) => ({ ...prev, preferredMonths: [monthOptions[monthIndex]] }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      preferredMonths: rangeIndices.map((index) => monthOptions[index])
    }));
    setMonthRangeStart(null);
  }

  function toggleOpportunity(opportunity) {
    setForm((prev) => ({
      ...prev,
      opportunityTypes: prev.opportunityTypes.includes(opportunity)
        ? prev.opportunityTypes.filter((item) => item !== opportunity)
        : [...prev.opportunityTypes, opportunity]
    }));
  }

  function togglePracticeEnvironment(item) {
    setForm((prev) => ({
      ...prev,
      practiceEnvironment: prev.practiceEnvironment.includes(item)
        ? prev.practiceEnvironment.filter((entry) => entry !== item)
        : [...prev.practiceEnvironment, item]
    }));
  }

  async function handleSubmit() {
    try {
      setSubmitError('');
      const errors = validateApplyForm(form);

      const missingDocuments = REQUIRED_DOCUMENTS.filter((docType) => !files[docType]);
      if (missingDocuments.length > 0) {
        errors.documents = `Upload required documents: ${missingDocuments.join(', ')}`;
      }

      const nextDocumentErrors = {};
      for (const docType of REQUIRED_DOCUMENTS) {
        if (!files[docType]) continue;
        const maybeError = validateDocumentFile(files[docType]);
        if (maybeError) {
          nextDocumentErrors[docType] = maybeError;
        }
      }

      setDocumentErrors(nextDocumentErrors);
      setFieldErrors(errors);
      if (Object.keys(errors).length > 0 || Object.keys(nextDocumentErrors).length > 0) {
        setSubmitError('Please fix the highlighted fields before submitting.');
        return;
      }

      const created = await addApplicant(form);
      const uploads = Object.entries(files)
        .filter(([, file]) => Boolean(file))
        .map(([docType, file]) => uploadDocument(created.applicant.id, docType, file, created.token));

      await Promise.all(uploads);
      navigate('/student');
    } catch (error) {
      setSubmitError(error.message || 'Unable to submit application. Please try again.');
    }
  }

  return (
    <div className="space-y-6" data-design-mode="true">
      <GatekeeperModal open={!eligible} onEligibilityChange={setEligible} />

      <Card>
        <CardHeader>
          <CardTitle>Clinical Experience Application (USCE)</CardTitle>
          <CardDescription>Complete all sections. Missing required fields will block submission.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep} onValueChange={setCurrentStep}>
            <TabsList className="w-full justify-start overflow-auto">
              <TabsTrigger value="step1">Personal Information</TabsTrigger>
              <TabsTrigger value="step2">Medical Education</TabsTrigger>
              <TabsTrigger value="step3">Preferences & Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="step1" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="First Name"
                  value={form.firstName}
                  error={fieldErrors.firstName}
                  onChange={(value) => updateField('firstName', value)}
                />
                <Field
                  label="Last Name"
                  value={form.lastName}
                  error={fieldErrors.lastName}
                  onChange={(value) => updateField('lastName', value)}
                />
              </div>
              <Field
                label="Email Address"
                type="email"
                value={form.email}
                error={fieldErrors.email}
                onChange={(value) => updateField('email', value)}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Create Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      aria-invalid={Boolean(fieldErrors.password)}
                      className={`pr-10 ${fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      onChange={(event) => updateField('password', event.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password ? <p className="text-xs text-red-600">{fieldErrors.password}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      aria-invalid={Boolean(fieldErrors.confirmPassword)}
                      className={`pr-10 ${fieldErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      onChange={(event) => updateField('confirmPassword', event.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-700"
                    >
                      {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword ? <p className="text-xs text-red-600">{fieldErrors.confirmPassword}</p> : null}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Phone Number"
                  value={form.phone}
                  error={fieldErrors.phone}
                  onChange={(value) => updateField('phone', value)}
                />
                <Field
                  label="Birthdate"
                  type="date"
                  value={form.birthDate}
                  error={fieldErrors.birthDate}
                  onChange={(value) => updateField('birthDate', value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Country of Birth"
                  value={form.countryOfBirth}
                  error={fieldErrors.countryOfBirth}
                  onChange={(value) => updateField('countryOfBirth', value)}
                />
                <Field label="Country" value={form.country} error={fieldErrors.country} onChange={(value) => updateField('country', value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Country Issuing Passport"
                  value={form.passportIssuingCountry}
                  error={fieldErrors.passportIssuingCountry}
                  onChange={(value) => updateField('passportIssuingCountry', value)}
                />
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select
                    value={form.gender}
                    aria-invalid={Boolean(fieldErrors.gender)}
                    className={fieldErrors.gender ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    onChange={(event) => updateField('gender', event.target.value)}
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </Select>
                  {fieldErrors.gender ? <p className="text-xs text-red-600">{fieldErrors.gender}</p> : null}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Current Immigration Status</Label>
                <Select
                  value={form.usStatus}
                  aria-invalid={Boolean(fieldErrors.usStatus)}
                  className={fieldErrors.usStatus ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  onChange={(event) => updateField('usStatus', event.target.value)}
                >
                  <option value="">Select status</option>
                  {usStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
                {fieldErrors.usStatus ? <p className="text-xs text-red-600">{fieldErrors.usStatus}</p> : null}
              </div>
              <Button onClick={() => setCurrentStep('step2')}>Continue</Button>
            </TabsContent>

            <TabsContent value="step2" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Medical School"
                  value={form.medicalSchool}
                  error={fieldErrors.medicalSchool}
                  onChange={(value) => updateField('medicalSchool', value)}
                />
                <Field
                  label="Medical School Country"
                  value={form.medicalSchoolCountry}
                  error={fieldErrors.medicalSchoolCountry}
                  onChange={(value) => updateField('medicalSchoolCountry', value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Academic Status</Label>
                  <Select
                    value={form.academicStatus}
                    aria-invalid={Boolean(fieldErrors.academicStatus)}
                    className={fieldErrors.academicStatus ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    onChange={(event) => updateField('academicStatus', event.target.value)}
                  >
                    <option value="">Select status</option>
                    {academicStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                  {fieldErrors.academicStatus ? <p className="text-xs text-red-600">{fieldErrors.academicStatus}</p> : null}
                </div>
                <Field
                  label="Graduation Year"
                  type="number"
                  value={form.graduationYear}
                  error={fieldErrors.graduationYear}
                  onChange={(value) => updateField('graduationYear', value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>USMLE Step 1 (Pass/Fail)</Label>
                  <Select
                    value={form.step1Score}
                    aria-invalid={Boolean(fieldErrors.step1Score)}
                    className={fieldErrors.step1Score ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    onChange={(event) => updateField('step1Score', event.target.value)}
                  >
                    <option value="">Select result</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </Select>
                  {fieldErrors.step1Score ? <p className="text-xs text-red-600">{fieldErrors.step1Score}</p> : null}
                </div>
                <Field
                  label="USMLE Step 2 Score (Optional)"
                  type="number"
                  value={form.step2Score}
                  error={fieldErrors.step2Score}
                  onChange={(value) => updateField('step2Score', value)}
                />
                <Field
                  label="USMLE Step 3 Score (Optional)"
                  type="number"
                  value={form.step3Score}
                  error={fieldErrors.step3Score}
                  onChange={(value) => updateField('step3Score', value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Completed Step 1</Label>
                  <Select
                    value={form.step1Completed}
                    aria-invalid={Boolean(fieldErrors.step1Completed)}
                    className={fieldErrors.step1Completed ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    onChange={(event) => updateField('step1Completed', event.target.value)}
                  >
                    <option value="">Select option</option>
                    {usmleCompletionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                  {fieldErrors.step1Completed ? <p className="text-xs text-red-600">{fieldErrors.step1Completed}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <Label>Completed Step 2</Label>
                  <Select
                    value={form.step2Completed}
                    aria-invalid={Boolean(fieldErrors.step2Completed)}
                    className={fieldErrors.step2Completed ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    onChange={(event) => updateField('step2Completed', event.target.value)}
                  >
                    <option value="">Select option</option>
                    {usmleCompletionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                  {fieldErrors.step2Completed ? <p className="text-xs text-red-600">{fieldErrors.step2Completed}</p> : null}
                </div>
                <div className="space-y-1.5">
                  <Label>Completed Step 3</Label>
                  <Select
                    value={form.step3Completed}
                    aria-invalid={Boolean(fieldErrors.step3Completed)}
                    className={fieldErrors.step3Completed ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    onChange={(event) => updateField('step3Completed', event.target.value)}
                  >
                    <option value="">Select option</option>
                    {usmleCompletionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                  {fieldErrors.step3Completed ? <p className="text-xs text-red-600">{fieldErrors.step3Completed}</p> : null}
                </div>
              </div>
              <Button onClick={() => setCurrentStep('step3')}>Continue</Button>
            </TabsContent>

            <TabsContent value="step3" className="space-y-6">
              <div>
                <Label>Preferred Rotation Months</Label>
                <p className="mt-1 text-xs text-slate-500">Select a start tile, then an end tile (up to 3 consecutive months, wrap-around supported).</p>

                <div className="mt-3 grid grid-cols-4 gap-2 md:grid-cols-6">
                  {monthOptions.map((month, index) => {
                    const isSelected = selectedMonthsSet.has(month);
                    const isPendingStart = monthRangeStart === index;
                    const isSelectableEnd = monthRangeStart === null || Boolean(buildConsecutiveRange(monthRangeStart, index));

                    return (
                      <button
                        key={month}
                        type="button"
                        onClick={() => handleMonthTileClick(index)}
                        className={`rounded-md border px-2 py-1.5 text-xs transition ${
                          isPendingStart
                            ? 'border-clinical bg-blue-100 font-semibold text-clinical'
                            : isSelected
                              ? 'border-clinical bg-blue-50 font-medium text-clinical'
                              : isSelectableEnd
                                ? 'border-slate-300 bg-white text-slate-700 hover:border-clinical/50 hover:bg-slate-50'
                                : 'border-slate-200 bg-slate-100 text-slate-400'
                        }`}
                      >
                        {month.replace(' 2026', '')}
                      </button>
                    );
                  })}
                </div>

                {form.preferredMonths.length > 0 ? (
                  <p className="mt-2 text-xs text-slate-600">
                    Selected: {form.preferredMonths[0]} to {form.preferredMonths[form.preferredMonths.length - 1]}
                  </p>
                ) : null}
                {fieldErrors.preferredMonths ? <p className="mt-2 text-xs text-red-600">{fieldErrors.preferredMonths}</p> : null}

                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMonthRangeStart(null);
                      setForm((prev) => ({ ...prev, preferredMonths: [] }));
                    }}
                  >
                    Clear Month Selection
                  </Button>
                </div>
              </div>

              <div>
                <Label>What is the goal with this rotation?</Label>
                <p className="mt-1 text-xs text-slate-500">Select all that apply.</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {opportunityOptions.map((opportunity) => (
                    <button
                      key={opportunity}
                      type="button"
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        form.opportunityTypes.includes(opportunity)
                          ? 'border-clinical bg-blue-50 text-clinical'
                          : 'border-slate-300 bg-white text-slate-700'
                      }`}
                      onClick={() => toggleOpportunity(opportunity)}
                    >
                      {opportunity}
                    </button>
                  ))}
                </div>
                {fieldErrors.opportunityTypes ? <p className="mt-2 text-xs text-red-600">{fieldErrors.opportunityTypes}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>What setting?</Label>
                  <Select
                    value={form.setupPreference}
                    aria-invalid={Boolean(fieldErrors.setupPreference)}
                    className={fieldErrors.setupPreference ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    onChange={(event) => updateField('setupPreference', event.target.value)}
                  >
                    <option value="">Select set-up</option>
                    {setupOptions.map((setup) => (
                      <option key={setup} value={setup}>
                        {setup}
                      </option>
                    ))}
                  </Select>
                  {fieldErrors.setupPreference ? <p className="text-xs text-red-600">{fieldErrors.setupPreference}</p> : null}
                </div>

                <div className="space-y-1.5">
                  <Label>Accommodation Needed?</Label>
                  <Select
                    value={form.accommodationNeeded}
                    aria-invalid={Boolean(fieldErrors.accommodationNeeded)}
                    className={fieldErrors.accommodationNeeded ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    onChange={(event) => updateField('accommodationNeeded', event.target.value)}
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                  {fieldErrors.accommodationNeeded ? <p className="text-xs text-red-600">{fieldErrors.accommodationNeeded}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Prior US Rotation</Label>
                  <Select
                    value={form.priorUsRotation}
                    aria-invalid={Boolean(fieldErrors.priorUsRotation)}
                    className={fieldErrors.priorUsRotation ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    onChange={(event) => updateField('priorUsRotation', event.target.value)}
                  >
                    <option value="">Select option</option>
                    {priorUsRotationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                  {fieldErrors.priorUsRotation ? <p className="text-xs text-red-600">{fieldErrors.priorUsRotation}</p> : null}
                </div>
                <Field
                  label="Location"
                  value={form.rotationLocation}
                  error={fieldErrors.rotationLocation}
                  onChange={(value) => updateField('rotationLocation', value)}
                />
                <Field
                  label="Duration"
                  value={form.rotationDuration}
                  error={fieldErrors.rotationDuration}
                  onChange={(value) => updateField('rotationDuration', value)}
                />
              </div>

              <div>
                <Label>Practice Environment</Label>
                <p className="mt-1 text-xs text-slate-500">Select all that apply.</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {practiceEnvironmentOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`rounded-lg border px-3 py-2 text-left text-sm ${
                        form.practiceEnvironment.includes(item)
                          ? 'border-clinical bg-blue-50 text-clinical'
                          : 'border-slate-300 bg-white text-slate-700'
                      }`}
                      onClick={() => togglePracticeEnvironment(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {fieldErrors.practiceEnvironment ? <p className="mt-2 text-xs text-red-600">{fieldErrors.practiceEnvironment}</p> : null}
              </div>

              <Field
                label="Subspecialty Interest"
                value={form.specialtyPreference}
                error={fieldErrors.specialtyPreference}
                onChange={(value) => updateField('specialtyPreference', value)}
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <Label>Required Documents</Label>
                <p className="mt-1 text-xs text-slate-600">Upload all documents as PDF files (max 5 MB each).</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700">
                  {REQUIRED_DOCUMENTS.map((docType) => (
                    <li key={docType}>{docType}</li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {REQUIRED_DOCUMENTS.map((docType) => (
                  <DocumentDropzone
                    key={docType}
                    label={docType}
                    required
                    helperText="Drag and drop PDF (max 5 MB) or click to upload"
                    error={documentErrors[docType] || ''}
                    onFileSelected={(file) => handleDocumentSelected(docType, file)}
                  />
                ))}
              </div>
              {fieldErrors.documents ? <p className="text-xs text-red-600">{fieldErrors.documents}</p> : null}

              <div className="rounded-xl border border-slate-200 p-4">
                <Label htmlFor="referral">How did you hear about us?</Label>
                <Select id="referral" className="mt-2">
                  <option>Friend / Alumni</option>
                  <option>Agency</option>
                  <option>Online Search</option>
                  <option>Social Media</option>
                </Select>
              </div>

              {submitError ? <p className="text-xs text-red-600">{submitError}</p> : null}
              <Button onClick={handleSubmit} disabled={!canSubmit}>Submit Application</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', error = '' }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        aria-invalid={Boolean(error)}
        className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
