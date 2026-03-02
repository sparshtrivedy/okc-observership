import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/form-controls';
import { Button } from '../components/ui/button';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    setError('');

    try {
      await adminLogin(identifier, password);
      navigate('/admin');
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in right now. Please try again.');
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
            <Label>Email / Username</Label>
            <Input value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                className="pr-10"
                onChange={(event) => setPassword(event.target.value)}
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
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <Button onClick={login} disabled={loading || !identifier || !password}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
