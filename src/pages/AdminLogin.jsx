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

  function login() {
    if (password === 'okcadmin') {
      setAdminAuthenticated(true);
      navigate('/admin');
      return;
    }
    setError('Invalid password. Try: okcadmin');
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
          <Button onClick={login}>Sign In</Button>
        </CardContent>
      </Card>
    </div>
  );
}
