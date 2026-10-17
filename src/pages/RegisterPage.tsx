import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Loader2, Search, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function RegisterPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // If a signed-in user without a profile lands here (e.g. just registered), complete setup
  async function completeSignup(userId: string) {
    const { error: pErr } = await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName,
      role,
    });
    if (pErr) throw pErr;
    await refreshProfile();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) throw signUpErr;
      if (data.user) {
        await completeSignup(data.user.id);
        navigate(role === 'provider' ? '/dashboard/company/new' : '/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleCompleteProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (!user) throw new Error('Not signed in');
      await completeSignup(user.id);
      navigate(role === 'provider' ? '/dashboard/company/new' : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (user && !profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-espresso-100 bg-cream-50 p-8 shadow-sm">
      <h1 className="font-display text-2xl font-semibold text-espresso-900">Complete your profile</h1>
      <p className="mt-1 text-sm text-espresso-500">Signed in as {user.email}</p>
          <form onSubmit={handleCompleteProfile} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-espresso-700">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard
                active={role === 'customer'}
                onClick={() => setRole('customer')}
                icon={<Search size={18} />}
                title="Customer"
                desc="I need a service"
              />
              <RoleCard
                active={role === 'provider'}
                onClick={() => setRole('provider')}
                icon={<Building2 size={18} />}
                title="Provider"
                desc="I offer a service"
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300 disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-espresso-100 bg-cream-50 p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-peach-100 text-espresso-600">
            <UserPlus size={22} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-espresso-900">Create your account</h1>
            <p className="text-sm text-espresso-500">Join BrokerLink for free</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-espresso-700">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-espresso-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-espresso-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-espresso-700">I am a...</span>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <RoleCard
                active={role === 'customer'}
                onClick={() => setRole('customer')}
                icon={<Search size={18} />}
                title="Customer"
                desc="I need a service"
              />
              <RoleCard
                active={role === 'provider'}
                onClick={() => setRole('provider')}
                icon={<Building2 size={18} />}
                title="Service Provider"
                desc="I offer a service"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-espresso-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-3 text-left transition ${
        active
          ? 'border-amber-500 bg-peach-50 ring-2 ring-peach-100'
          : 'border-espresso-200 bg-cream-50 hover:border-espresso-400'
      }`}
    >
      <span className={active ? 'text-amber-600' : 'text-espresso-400'}>{icon}</span>
      <p className={`mt-1 text-sm font-semibold ${active ? 'text-espresso-900' : 'text-espresso-700'}`}>{title}</p>
      <p className="text-xs text-espresso-500">{desc}</p>
    </button>
  );
}
