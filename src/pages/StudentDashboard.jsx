import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatusTimeline from '../components/forms/StatusTimeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function StudentDashboard() {
  const { currentStudent } = useApp();

  if (!currentStudent) {
    return <p className="text-sm text-slate-600">No student profile found yet.</p>;
  }

  return (
    <div className="space-y-6" data-design-mode="true">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {currentStudent.fullName}</CardTitle>
          <CardDescription>Track your application and document verification progress.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Tracker</CardTitle>
          <CardDescription>Submitted - Under Review - Interview - Accepted - Onboarding</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusTimeline currentStatus={currentStudent.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Vault</CardTitle>
          <CardDescription>Review which documents are cleared versus pending action.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.entries(currentStudent.documents).map(([name, status]) => (
              <li key={name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {status === 'Verified' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <Badge variant={status === 'Verified' ? 'success' : 'warning'}>{status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
