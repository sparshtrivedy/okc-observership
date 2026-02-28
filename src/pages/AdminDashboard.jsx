import { useMemo, useState } from 'react';
import { ExternalLink, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label, Select } from '../components/ui/form-controls';
import { Button } from '../components/ui/button';

export default function AdminDashboard() {
  const { applicants, statuses, setApplicantStatus, mailLog } = useApp();
  const [selectedId, setSelectedId] = useState(applicants[0]?.id || '');
  const [minStepScore, setMinStepScore] = useState('');
  const [graduationYear, setGraduationYear] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const selected = applicants.find((item) => item.id === selectedId) || applicants[0];

  const filtered = useMemo(() => {
    return applicants.filter((applicant) => {
      const scorePass = minStepScore ? applicant.step2Score >= Number(minStepScore) : true;
      const gradPass = graduationYear === 'all' ? true : String(applicant.graduationYear) === graduationYear;
      const statusPass = statusFilter === 'all' ? true : applicant.status === statusFilter;
      return scorePass && gradPass && statusPass;
    });
  }, [applicants, graduationYear, minStepScore, statusFilter]);

  const graduationYears = Array.from(new Set(applicants.map((item) => item.graduationYear))).sort((a, b) => b - a);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr,1fr]" data-design-mode="true">
      <Card>
        <CardHeader>
          <CardTitle>Applicant Management</CardTitle>
          <CardDescription>Filter by Step score, graduation year, or status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Minimum Step 2 Score</Label>
              <Input
                type="number"
                value={minStepScore}
                onChange={(event) => setMinStepScore(event.target.value)}
                placeholder="e.g. 240"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Graduation Year</Label>
              <Select value={graduationYear} onChange={(event) => setGraduationYear(event.target.value)}>
                <option value="all">All</option>
                {graduationYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Step 2</TableHead>
                <TableHead>Grad Year</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((applicant) => (
                <TableRow
                  key={applicant.id}
                  className={selected?.id === applicant.id ? 'bg-blue-50' : ''}
                  onClick={() => setSelectedId(applicant.id)}
                >
                  <TableCell>
                    <p className="font-medium">{applicant.fullName}</p>
                    <p className="text-xs text-slate-500">{applicant.id}</p>
                  </TableCell>
                  <TableCell>{applicant.step2Score}</TableCell>
                  <TableCell>{applicant.graduationYear}</TableCell>
                  <TableCell>
                    <Badge variant="info">{applicant.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{selected.fullName}</CardTitle>
              <CardDescription>{selected.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                <span className="font-semibold text-slate-800">Medical School:</span> {selected.medicalSchool}
              </p>
              <p>
                <span className="font-semibold text-slate-800">USMLE:</span> Step 1 {selected.step1Score} / Step 2 {selected.step2Score}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Preferred Months:</span> {selected.preferredMonths.join(', ')}
              </p>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">Uploaded PDFs</p>
                {Object.entries(selected.uploads || {}).length === 0 ? (
                  <p className="text-slate-500">No uploaded files yet.</p>
                ) : (
                  Object.entries(selected.uploads || {}).map(([type, file]) => (
                    <a
                      key={type}
                      className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50"
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span>{type}</span>
                      <span className="flex items-center gap-1 text-xs text-clinical">
                        Open PDF <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">Status Controls</p>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selected.status === status ? 'default' : 'outline'}
                      onClick={() => setApplicantStatus(selected.id, status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-clinical" /> Mock Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-slate-600">
                {mailLog.slice(0, 4).map((mail, index) => (
                  <li key={`${mail.at}-${index}`} className="rounded-md border border-slate-200 p-2">
                    <p className="font-semibold text-slate-800">{mail.subject}</p>
                    <p>To: {mail.to}</p>
                  </li>
                ))}
                {mailLog.length === 0 ? <li>No status updates sent yet.</li> : null}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
