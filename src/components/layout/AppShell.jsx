import { Link, NavLink } from 'react-router-dom';
import { Hospital, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AppShell({ children }) {
  return (
    <div data-design-mode="true" className="min-h-screen">
      <div className="bg-gradient-to-r from-red-500 to-yellow-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-2 text-sm">
          <ShieldAlert className="h-4 w-4" />
          Strictly In-Person. We do not provide B1/B2 Visa Sponsorship at this time.
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur transition-shadow duration-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-600 p-2 text-white">
              <Hospital className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">OKC Clinical Experience</p>
            </div>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/apply">Apply</NavItem>
            <NavItem to="/student">Student Dashboard</NavItem>
            <NavItem to="/admin">Admin</NavItem>
          </nav>
        </div>
      </header>

      <main className="page-enter mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-2 transition-all duration-200 ease-out',
          isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-blue-100 hover:text-blue-600'
        )
      }
    >
      {children}
    </NavLink>
  );
}
