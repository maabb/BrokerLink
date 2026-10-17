import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Search, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { RegisterModal } from '@/components/RegisterModal';
import { useAuth } from '@/lib/auth';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    setBusy(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-espresso-100 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-espresso-900">
          <Logo size={36} />
          <span className="font-display text-lg font-semibold">BrokerLink</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-espresso-600 transition hover:bg-espresso-50 hover:text-espresso-900"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Find Services</span>
          </Link>
          {user ? (
            <>
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-espresso-600 transition hover:bg-espresso-50 hover:text-espresso-900"
                >
                  <ShieldCheck size={16} />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-espresso-600 transition hover:bg-espresso-50 hover:text-espresso-900"
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="hidden items-center gap-2 rounded-full bg-peach-50 px-3 py-1.5 md:flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-espresso-700 text-xs font-bold text-cream-50">
                  {(profile?.full_name || user.email || '?').charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[140px] truncate text-sm text-espresso-700">
                  {profile?.full_name || user.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-espresso-400 transition hover:bg-espresso-50 hover:text-espresso-700 disabled:opacity-50"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-espresso-600 transition hover:bg-espresso-50 hover:text-espresso-900"
              >
                Sign In
              </Link>
              <button
                onClick={() => setShowRegister(true)}
                className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-espresso-700 shadow-sm transition hover:-translate-y-px hover:bg-amber-300"
              >
                Get Started
              </button>
            </>
          )}
        </nav>
      </div>
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
    </header>
  );
}
