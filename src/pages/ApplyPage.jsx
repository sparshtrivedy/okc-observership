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

const monthOptions = ['May 2026', 'June 2026', 'July 2026', 'August 2026', 'September 2026', 'October 2026'];

export default function ApplyPage() {
  const navigate = useNavigate();
  const { addApplicant, uploadDocument } = useApp();
  const [eligible, setEligible] = useState(false);
  const [currentStep, setCurrentStep] = useState('step1');
  const [files, setFiles] = useState({});
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    medicalSchool: '',
    graduationYear: '',
    step1Score: '',
    step2Score: '',
    preferredMonths: [],
    visaConfirmed: true,
    travelConfirmed: true
  });

  const canSubmit = useMemo(
    () =>
      form.fullName &&
      form.email &&
      form.medicalSchool &&
      form.graduationYear &&
      form.step1Score &&
      form.step2Score &&
      form.preferredMonths.length > 0,
    [form]
  );

  function toggleMonth(month) {
    setForm((prev) => ({
      ...prev,
      preferredMonths: prev.preferredMonths.includes(month)
        ? prev.preferredMonths.filter((m) => m !== month)
        : [...prev.preferredMonths, month]
    }));
  }

  function handleSubmit() {
    const applicant = addApplicant(form);
    Object.entries(files).forEach(([docType, file]) => {
      if (file) uploadDocument(applicant.id, docType, file.name);
    });
    navigate('/student');
  }

  return (
    <div className="space-y-6" data-design-mode="true">
      <GatekeeperModal open={!eligible} onEligibilityChange={setEligible} />

      <Card>
        <CardHeader>
          <CardTitle>USCE Application</CardTitle>
          <CardDescription>Complete all sections. Missing required fields will block submission.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep} onValueChange={setCurrentStep}>
            <TabsList className="w-full justify-start overflow-auto">
              <TabsTrigger value="step1">Personal Info</TabsTrigger>
              <TabsTrigger value="step2">School & Scores</TabsTrigger>
              <TabsTrigger value="step3">Months & Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="step1" className="space-y-4">
              <Field label="Full Name" value={form.fullName} onChange={(value) => setForm((prev) => ({ ...prev, fullName: value }))} />
              <Field label="Email" type="email" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} />
              <Field label="Phone" value={form.phone} onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))} />
              <Field label="Country" value={form.country} onChange={(value) => setForm((prev) => ({ ...prev, country: value }))} />
              <Button onClick={() => setCurrentStep('step2')}>Continue</Button>
            </TabsContent>

            <TabsContent value="step2" className="space-y-4">
              <Field
                label="Medical School"
                value={form.medicalSchool}
                onChange={(value) => setForm((prev) => ({ ...prev, medicalSchool: value }))}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label="Graduation Year"
                  type="number"
                  value={form.graduationYear}
                  onChange={(value) => setForm((prev) => ({ ...prev, graduationYear: value }))}
                />
                <Field
                  label="USMLE Step 1"
                  type="number"
                  value={form.step1Score}
                  onChange={(value) => setForm((prev) => ({ ...prev, step1Score: value }))}
                />
                <Field
                  label="USMLE Step 2"
                  type="number"
                  value={form.step2Score}
                  onChange={(value) => setForm((prev) => ({ ...prev, step2Score: value }))}
                />
              </div>
              <Button onClick={() => setCurrentStep('step3')}>Continue</Button>
            </TabsContent>

            <TabsContent value="step3" className="space-y-6">
              <div>
                <Label>Preferred Rotation Months</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {monthOptions.map((month) => (
                    <button
                      key={month}
                      type="button"
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        form.preferredMonths.includes(month)
                          ? 'border-clinical bg-blue-50 text-clinical'
                          : 'border-slate-300 bg-white text-slate-700'
                      }`}
                      onClick={() => toggleMonth(month)}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>

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
