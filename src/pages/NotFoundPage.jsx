import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="space-y-3 text-center">
      <h2 className="text-2xl font-bold text-slate-900">Page not found</h2>
      <p className="text-sm text-slate-600">The page you requested does not exist.</p>
      <Button asChild>
        <Link to="/">Back Home</Link>
      </Button>
    </div>
  );
}
