import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/form-controls';
import { Button } from '../components/ui/button';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { studentLogin } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError('');

    try {
      await studentLogin(email, password);
      navigate('/student');
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md" data-design-mode="true">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-clinical" /> Student Login
          </CardTitle>
          <CardDescription>Use the email and password from your application submission.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <Button onClick={login} disabled={loading || !email || !password}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
