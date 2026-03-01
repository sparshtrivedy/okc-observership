import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GatekeeperModal from '../components/forms/GatekeeperModal';
import DocumentDropzone from '../components/forms/DocumentDropzone';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label, Select } from '../components/ui/form-controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

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
const opportunityOptions = ['Hands-On Experience', 'Observership', 'Clinical Research'];
const usStatusOptions = ['Citizen', 'Permanent Resident', 'Temporary Resident', 'None'];
const setupOptions = ['Clinic', 'Hospital', 'Both'];
const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const academicStatusOptions = ['Currently Attending', 'Graduated', 'Other'];

export default function ApplyPage() {
  const navigate = useNavigate();
  const { addApplicant, uploadDocument } = useApp();
  const [eligible, setEligible] = useState(false);
  const [currentStep, setCurrentStep] = useState('step1');
  const [files, setFiles] = useState({});
  const [submitError, setSubmitError] = useState('');
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
    usStatus: '',
    preferredMonths: [],
    opportunityTypes: [],
    setupPreference: '',
    specialtyPreference: '',
    accommodationNeeded: '',
    visaConfirmed: true,
    travelConfirmed: true
  });

  const canSubmit = useMemo(
    () =>
      form.firstName &&
      form.lastName &&
      form.email &&
      form.password &&
      form.password.length >= 8 &&
      form.password === form.confirmPassword &&
      form.phone &&
      form.birthDate &&
      form.countryOfBirth &&
      form.gender &&
      form.passportIssuingCountry &&
      form.medicalSchool &&
      form.medicalSchoolCountry &&
      form.academicStatus &&
      form.graduationYear &&
      form.step1Score &&
      form.step2Score &&
      form.step3Score &&
      form.usStatus &&
      form.preferredMonths.length > 0 &&
      form.opportunityTypes.length > 0 &&
      form.setupPreference &&
      form.specialtyPreference &&
      form.accommodationNeeded,
    [form]
  );

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

  async function handleSubmit() {
    try {
      setSubmitError('');
      const applicant = await addApplicant(form);
      const uploads = Object.entries(files)
        .filter(([, file]) => Boolean(file))
        .map(([docType, file]) => uploadDocument(applicant.id, docType, file.name));

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
                  onChange={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
                />
                <Field
                  label="Last Name"
                  value={form.lastName}
                  onChange={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
                />
              </div>
              <Field
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Create Password"
                  type="password"
                  value={form.password}
                  onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
                />
                <Field
                  label="Confirm Password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(value) => setForm((prev) => ({ ...prev, confirmPassword: value }))}
                />
              </div>
              {form.password && form.password.length < 8 ? (
                <p className="text-xs text-red-600">Password must be at least 8 characters.</p>
              ) : null}
              {form.confirmPassword && form.password !== form.confirmPassword ? (
                <p className="text-xs text-red-600">Password confirmation does not match.</p>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Phone Number"
                  value={form.phone}
                  onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                />
                <Field
                  label="Birthdate"
                  type="date"
                  value={form.birthDate}
                  onChange={(value) => setForm((prev) => ({ ...prev, birthDate: value }))}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Country of Birth"
                  value={form.countryOfBirth}
                  onChange={(value) => setForm((prev) => ({ ...prev, countryOfBirth: value }))}
                />
                <Field label="Country" value={form.country} onChange={(value) => setForm((prev) => ({ ...prev, country: value }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Country Issuing Passport"
                  value={form.passportIssuingCountry}
                  onChange={(value) => setForm((prev) => ({ ...prev, passportIssuingCountry: value }))}
                />
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select value={form.gender} onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}>
                    <option value="">Select gender</option>
                    {genderOptions.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Status in the US</Label>
                <Select value={form.usStatus} onChange={(event) => setForm((prev) => ({ ...prev, usStatus: event.target.value }))}>
                  <option value="">Select status</option>
                  {usStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
              <Button onClick={() => setCurrentStep('step2')}>Continue</Button>
            </TabsContent>

            <TabsContent value="step2" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Medical School"
                  value={form.medicalSchool}
                  onChange={(value) => setForm((prev) => ({ ...prev, medicalSchool: value }))}
                />
                <Field
                  label="Medical School Country"
                  value={form.medicalSchoolCountry}
                  onChange={(value) => setForm((prev) => ({ ...prev, medicalSchoolCountry: value }))}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Academic Status</Label>
                  <Select
                    value={form.academicStatus}
                    onChange={(event) => setForm((prev) => ({ ...prev, academicStatus: event.target.value }))}
                  >
                    <option value="">Select status</option>
                    {academicStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </div>
                <Field
                  label="Graduation Year"
                  type="number"
                  value={form.graduationYear}
                  onChange={(value) => setForm((prev) => ({ ...prev, graduationYear: value }))}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>USMLE Step 1 (Pass/Fail)</Label>
                  <Select
                    value={form.step1Score}
                    onChange={(event) => setForm((prev) => ({ ...prev, step1Score: event.target.value }))}
                  >
                    <option value="">Select result</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </Select>
                </div>
                <Field
                  label="USMLE Step 2"
                  type="number"
                  value={form.step2Score}
                  onChange={(value) => setForm((prev) => ({ ...prev, step2Score: value }))}
                />
                <Field
                  label="USMLE Step 3"
                  type="number"
                  value={form.step3Score}
                  onChange={(value) => setForm((prev) => ({ ...prev, step3Score: value }))}
                />
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
                <Label>Preferred Experience Type(s)</Label>
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Set-up Preference</Label>
                  <Select
                    value={form.setupPreference}
                    onChange={(event) => setForm((prev) => ({ ...prev, setupPreference: event.target.value }))}
                  >
                    <option value="">Select set-up</option>
                    {setupOptions.map((setup) => (
                      <option key={setup} value={setup}>
                        {setup}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Accommodation Needed?</Label>
                  <Select
                    value={form.accommodationNeeded}
                    onChange={(event) => setForm((prev) => ({ ...prev, accommodationNeeded: event.target.value }))}
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Select>
                </div>
              </div>

              <Field
                label="Specialty Preference"
                value={form.specialtyPreference}
                onChange={(value) => setForm((prev) => ({ ...prev, specialtyPreference: value }))}
              />

              <div className="grid gap-3 md:grid-cols-2">
                <DocumentDropzone label="CV" onFileSelected={(file) => setFiles((prev) => ({ ...prev, CV: file }))} />
                <DocumentDropzone
                  label="Passport Bio"
                  onFileSelected={(file) => setFiles((prev) => ({ ...prev, 'Passport Bio': file }))}
                />
                <DocumentDropzone
                  label="Step Score Report"
                  onFileSelected={(file) => setFiles((prev) => ({ ...prev, 'Step Score Report': file }))}
                />
                <DocumentDropzone
                  label="Immunization Records"
                  onFileSelected={(file) => setFiles((prev) => ({ ...prev, 'Immunization Records': file }))}
                />
              </div>

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

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
