import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/form-controls';
import { Button } from '../components/ui/button';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdminAuthenticated } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        setError('Invalid admin credentials.');
        return;
      }

      setAdminAuthenticated(true);
      navigate('/admin');
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md" data-design-mode="true">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-clinical" /> Admin Access
          </CardTitle>
          <CardDescription>Protected route for staff applicant management.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <Button onClick={login} disabled={loading || !password}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
