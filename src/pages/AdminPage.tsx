import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, FileText, Loader2, ShieldCheck, Star, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Company, Deal, Profile, Review, ServiceRequest } from '@/lib/types';

export function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const [pRes, cRes, rRes, dRes, revRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('companies').select('*, category:categories(name)').order('created_at', { ascending: false }),
        supabase.from('service_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('deals').select('*, company:companies(id, name)').order('created_at', { ascending: false }).limit(20),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      if (!alive) return;
      setProfiles((pRes.data as Profile[]) ?? []);
      setCompanies((cRes.data as Company[]) ?? []);
      setRequests((rRes.data as ServiceRequest[]) ?? []);
      setDeals((dRes.data as Deal[]) ?? []);
      setReviews((revRes.data as Review[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  if (authLoading || !user) return null;

  if (profile && profile.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-espresso-300" />
        <p className="mt-3 font-display text-lg font-semibold text-espresso-900">Admin access only</p>
        <p className="mt-1 text-sm text-espresso-500">This area is restricted to the site administrator.</p>
      </div>
    );
  }

  const customers = profiles.filter((p) => p.role === 'customer').length;
  const providers = profiles.filter((p) => p.role === 'provider').length;
  const openRequests = requests.filter((r) => r.status === 'open').length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-espresso-700 text-cream-50">
          <ShieldCheck size={22} />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold text-espresso-900">Admin Portal</h1>
          <p className="text-sm text-espresso-500">Everything happening on BrokerLink at a glance</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <>
          {/* Platform stats */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Registered users" value={profiles.length} icon={<Users size={18} />} />
            <StatCard label="Customers" value={customers} icon={<Users size={18} />} />
            <StatCard label="Service providers" value={providers} icon={<Building2 size={18} />} />
            <StatCard label="Companies listed" value={companies.length} icon={<Building2 size={18} />} />
            <StatCard label="Service requests" value={requests.length} icon={<FileText size={18} />} />
            <StatCard label="Open requests" value={openRequests} icon={<FileText size={18} />} />
            <StatCard label="Deals completed" value={deals.length} icon={<CheckCircle2 size={18} />} />
            <StatCard label="Reviews posted" value={reviews.length} icon={<Star size={18} />} />
          </div>

          {/* Users */}
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-espresso-900">Users</h2>
            {profiles.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-8 text-center text-sm text-espresso-500">
                No registered users yet.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-2xl border border-espresso-100 bg-cream-50 shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-espresso-100 text-xs uppercase tracking-wide text-espresso-400">
                      <th className="px-5 py-3 font-medium">Name</th>
                      <th className="px-5 py-3 font-medium">Email</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr key={p.id} className="border-b border-espresso-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-espresso-800">{p.full_name || '—'}</td>
                        <td className="px-5 py-3 text-espresso-600">{p.email}</td>
                        <td className="px-5 py-3">
                          <RoleBadge role={p.role} />
                        </td>
                        <td className="px-5 py-3 text-espresso-500">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Companies */}
          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-espresso-900">Companies</h2>
            {companies.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-8 text-center text-sm text-espresso-500">
                No companies listed yet.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-2xl border border-espresso-100 bg-cream-50 shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-espresso-100 text-xs uppercase tracking-wide text-espresso-400">
                      <th className="px-5 py-3 font-medium">Company</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Rating</th>
                      <th className="px-5 py-3 font-medium">Deals</th>
                      <th className="px-5 py-3 font-medium">Listed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((c) => (
                      <tr key={c.id} className="border-b border-espresso-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-espresso-800">{c.name}</td>
                        <td className="px-5 py-3 text-espresso-600">{c.category?.name ?? 'General'}</td>
                        <td className="px-5 py-3 text-espresso-600">
                          {c.review_count > 0 ? `${Number(c.avg_rating).toFixed(1)} (${c.review_count})` : '—'}
                        </td>
                        <td className="px-5 py-3 text-espresso-600">{c.deal_count}</td>
                        <td className="px-5 py-3 text-espresso-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Recent activity */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <section>
              <h2 className="font-display text-xl font-semibold text-espresso-900">Recent deals</h2>
              {deals.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-8 text-center text-sm text-espresso-500">
                  No deals yet.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {deals.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-2xl border border-espresso-100 bg-cream-50 p-4 shadow-sm"
                    >
                      <span className="text-sm font-semibold text-espresso-800">{d.company?.name ?? 'Company'}</span>
                      <span className="text-xs text-espresso-500">{new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-espresso-900">Recent reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-3 rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-8 text-center text-sm text-espresso-500">
                  No reviews yet.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-espresso-100 bg-cream-50 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <Stars value={r.rating} size={13} />
                        <span className="text-xs text-espresso-500">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="mt-1.5 text-sm text-espresso-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-espresso-100 bg-cream-50 p-5 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-peach-100 text-espresso-600">{icon}</span>
      <div>
        <p className="font-display text-2xl font-semibold text-espresso-900">{value}</p>
        <p className="text-xs text-espresso-500">{label}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-espresso-700 text-cream-50',
    provider: 'bg-peach-100 text-espresso-700',
    customer: 'bg-espresso-100 text-espresso-600',
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[role] ?? ''}`}>{role}</span>
  );
}

function Stars({ value, size }: { value: number; size: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className={i <= value ? 'fill-amber-500 text-amber-500' : 'fill-espresso-100 text-espresso-100'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}
