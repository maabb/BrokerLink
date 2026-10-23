import { useEffect, useState } from 'react';
import { Building2, CheckCircle2, FileText, Loader2, Send, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Company, Deal, Proposal, ServiceRequest } from '@/lib/types';
import { Stars } from '@/components/Stars';

export function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const [compRes, reqRes, propRes, dealRes] = await Promise.all([
        supabase.from('companies').select('*').eq('owner_id', user.id),
        supabase
          .from('service_requests')
          .select('*, category:categories(name, slug, icon)')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('proposals')
          .select('*, company:companies(id, name, avg_rating, review_count, deal_count, city, country)')
          .eq('provider_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('deals')
          .select('*, company:companies(id, name)')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      if (!alive) return;
      setCompanies((compRes.data as Company[]) ?? []);
      setRequests((reqRes.data as ServiceRequest[]) ?? []);
      setProposals((propRes.data as Proposal[]) ?? []);
      setDeals((dealRes.data as Deal[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  if (authLoading || !user || loading) return null;

  if (profile?.role === 'provider') {
    return <ProviderDashboard companies={companies} proposals={proposals} />;
  }
  return <CustomerDashboard requests={requests} deals={deals} />;
}

/* ---------------- Provider view ---------------- */

function ProviderDashboard({
  companies,
  proposals,
}: {
  companies: Company[];
  proposals: Proposal[];
}) {
  const company = companies[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold text-espresso-900">Provider Dashboard</h1>

      {!company ? (
        <div className="mt-6 rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-10 text-center">
          <Building2 className="mx-auto h-10 w-10 text-espresso-300" />
          <p className="mt-3 font-medium text-espresso-700">You haven't set up your company yet</p>
          <p className="mt-1 text-sm text-espresso-500">
            Create your company profile so customers can find you and you can send proposals.
          </p>
          <a
            href="/dashboard/company/new"
            className="mt-4 inline-block rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300"
          >
            Create Company Profile
          </a>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <StatCard label="Deals completed" value={company.deal_count} icon={<CheckCircle2 size={18} />} />
            <StatCard label="Average rating" value={company.avg_rating ? Number(company.avg_rating).toFixed(1) : '—'} icon={<Star size={18} />} />
            <StatCard label="Reviews received" value={company.review_count} icon={<FileText size={18} />} />
          </div>

          <OpenRequestsBoard companyId={company.id} />

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-espresso-900">My proposals</h2>
            {proposals.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-8 text-center text-sm text-espresso-500">
                No proposals yet. Submit one from the open requests below.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {proposals.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl border border-espresso-100 bg-cream-50 p-4 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-espresso-800">{p.message || 'Proposal'}</p>
                      <p className="text-xs text-espresso-500">
                        {p.price != null ? `$${Number(p.price).toLocaleString()}` : 'Price not set'} ·{' '}
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusPill status={p.status} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
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

function OpenRequestsBoard({ companyId }: { companyId: string }) {
  const [openRequests, setOpenRequests] = useState<ServiceRequest[]>([]);
  const [myProposals, setMyProposals] = useState<Record<string, Proposal>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const reqRes = await supabase
        .from('service_requests')
        .select('*, category:categories(name, slug, icon)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!alive) return;
      setOpenRequests((reqRes.data as ServiceRequest[]) ?? []);

      const propRes = await supabase.from('proposals').select('*').eq('company_id', companyId);
      if (!alive) return;
      const map: Record<string, Proposal> = {};
      ((propRes.data as Proposal[]) ?? []).forEach((p) => {
        map[p.request_id] = p;
      });
      setMyProposals(map);
    })();
    return () => {
      alive = false;
    };
  }, [companyId]);

  function onSubmitted(requestId: string, proposal: Proposal) {
    setMyProposals((m) => ({ ...m, [requestId]: proposal }));
    setExpanded(null);
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-espresso-900">Open requests</h2>
      {openRequests.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-8 text-center text-sm text-espresso-500">
          No open requests right now. Check back soon.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {openRequests.map((r) => {
            const existing = myProposals[r.id];
            return (
              <div key={r.id} className="rounded-2xl border border-espresso-100 bg-cream-50 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold text-espresso-900">{r.title}</h3>
                    <p className="mt-0.5 text-xs text-espresso-500">
                      {r.category?.name ?? 'General'}
                      {r.budget != null && ` · Budget up to ${Number(r.budget).toLocaleString()}`} ·{' '}
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    {r.description && <p className="mt-2 text-sm text-espresso-600">{r.description}</p>}
                  </div>
                  {existing ? (
                    <StatusPill status={existing.status} />
                  ) : (
                    <button
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      className="shrink-0 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300"
                    >
                      {expanded === r.id ? 'Cancel' : 'Send Proposal'}
                    </button>
                  )}
                </div>
                {expanded === r.id && !existing && (
                  <ProposalForm
                    requestId={r.id}
                    companyId={companyId}
                    onSubmitted={(p) => onSubmitted(r.id, p)}
                    onCancel={() => setExpanded(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ProposalForm({
  requestId,
  companyId,
  onSubmitted,
  onCancel,
}: {
  requestId: string;
  companyId: string;
  onSubmitted: (p: Proposal) => void;
  onCancel: () => void;
}) {
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data, error: insertErr } = await supabase
        .from('proposals')
        .insert({
          request_id: requestId,
          company_id: companyId,
          price: price ? Number(price) : null,
          message,
        })
        .select('*')
        .single();
      if (insertErr) throw insertErr;
      onSubmitted(data as Proposal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-2xl bg-peach-50 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-espresso-600">Your price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-espresso-600">Message to the customer</label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How you'll deliver, timeline, what's included..."
            className="mt-1 w-full rounded-xl border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300 disabled:opacity-60"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Submit Proposal
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2 text-sm font-medium text-espresso-600 hover:bg-espresso-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ---------------- Customer view ---------------- */

function CustomerDashboard({ requests, deals }: { requests: ServiceRequest[]; deals: Deal[] }) {
  const [proposalMap, setProposalMap] = useState<Record<string, Proposal[]>>({});
  const [reviewedDeals, setReviewedDeals] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    (async () => {
      const propRes = await supabase
        .from('proposals')
        .select('*, company:companies(id, name, avg_rating, review_count, deal_count, city, country)')
        .order('price', { ascending: true, nullsFirst: false });
      const revRes = await supabase.from('reviews').select('deal_id');
      if (!alive) return;
      const map: Record<string, Proposal[]> = {};
      ((propRes.data as Proposal[]) ?? []).forEach((p) => {
        (map[p.request_id] ??= []).push(p);
      });
      setProposalMap(map);
      setReviewedDeals(new Set(((revRes.data as { deal_id: string }[]) ?? []).map((r) => r.deal_id)));
    })();
    return () => {
      alive = false;
    };
  }, []);

  const reviewable = deals.filter((d) => !reviewedDeals.has(d.id));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-espresso-900">My Requests</h1>
        <a
          href="/requests/new"
          className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300"
        >
          New Request
        </a>
      </div>

      {reviewable.length > 0 && (
        <div className="mt-4 rounded-2xl border border-peach-200 bg-peach-50 p-5">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-espresso-900">
            <Star size={16} className="fill-amber-500 text-amber-500" />
            Leave a review ({reviewable.length})
          </h2>
          <p className="mt-1 text-sm text-espresso-600">You completed deals — share your experience.</p>
          <div className="mt-3 space-y-2">
            {reviewable.map((d) => (
              <ReviewRow key={d.id} deal={d} onDone={() => setReviewedDeals((s) => new Set(s).add(d.id))} />
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-espresso-300" />
          <p className="mt-3 font-medium text-espresso-700">You haven't posted any requests yet</p>
          <p className="mt-1 text-sm text-espresso-500">
            Post what you need and companies will send you proposals with prices.
          </p>
          <a
            href="/requests/new"
            className="mt-4 inline-block rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300"
          >
            Post Your First Request
          </a>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {requests.map((r) => (
            <RequestWithProposals key={r.id} request={r} proposals={proposalMap[r.id] ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestWithProposals({ request, proposals }: { request: ServiceRequest; proposals: Proposal[] }) {
  const { refreshProfile } = useAuth();
  const [items, setItems] = useState(proposals);
  const [status, setStatus] = useState(request.status);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => setItems(proposals), [proposals]);

  async function handleAccept(proposalId: string) {
    setError('');
    setBusyId(proposalId);
    try {
      const { error: rpcErr } = await supabase.rpc('accept_proposal', { p_proposal_id: proposalId });
      if (rpcErr) throw rpcErr;
      setItems((list) =>
        list.map((p) =>
          p.id === proposalId
            ? { ...p, status: 'accepted' as const }
            : p.status === 'pending'
              ? { ...p, status: 'rejected' as const }
              : p
        )
      );
      setStatus('closed');
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-espresso-100 bg-cream-50 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold text-espresso-900">{request.title}</h3>
          <p className="mt-0.5 text-xs text-espresso-500">
            {request.category?.name ?? 'General'}
            {request.budget != null && ` · Budget up to ${Number(request.budget).toLocaleString()}`} ·{' '}
            {new Date(request.created_at).toLocaleDateString()}
          </p>
          {request.description && <p className="mt-2 text-sm text-espresso-600">{request.description}</p>}
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            status === 'open' ? 'bg-espresso-700 text-cream-50' : 'bg-espresso-100 text-espresso-500'
          }`}
        >
          {status === 'open' ? 'Open' : 'Closed'}
        </span>
      </div>

      {items.length > 0 && (
        <div className="mt-4 border-t border-espresso-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-espresso-400">
            Proposals ({items.length})
          </p>
          <div className="mt-2 space-y-2">
            {items.map((p) => (
              <div
                key={p.id}
                className={`flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  p.status === 'accepted' ? 'border-amber-400 bg-peach-50' : 'border-espresso-100 bg-cream-50'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/companies/${p.company_id}`}
                      className="truncate text-sm font-semibold text-espresso-800 hover:text-amber-600"
                    >
                      {p.company?.name ?? 'Company'}
                    </a>
                    <Stars value={p.company?.avg_rating ?? null} size={12} />
                    <span className="text-xs text-espresso-400">
                      {p.company?.review_count ? `(${p.company.review_count})` : 'New'} · {p.company?.deal_count ?? 0}{' '}
                      deals
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-espresso-600">{p.message}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-bold text-espresso-900">
                    {p.price != null ? `$${Number(p.price).toLocaleString()}` : '—'}
                  </span>
                  {status === 'open' && p.status === 'pending' ? (
                    <button
                      onClick={() => handleAccept(p.id)}
                      disabled={busyId === p.id}
                      className="flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-2 text-xs font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300 disabled:opacity-60"
                    >
                      {busyId === p.id && <Loader2 size={12} className="animate-spin" />}
                      Accept Deal
                    </button>
                  ) : (
                    <StatusPill status={p.status} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && status === 'open' && (
        <p className="mt-3 rounded-2xl bg-peach-50 p-3 text-sm text-espresso-500">
          Waiting for proposals — companies in this category will see your request.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}

function ReviewRow({ deal, onDone }: { deal: Deal; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please pick a star rating.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: insertErr } = await supabase.from('reviews').insert({
        deal_id: deal.id,
        company_id: deal.company_id,
        rating,
        comment,
      });
      if (insertErr) throw insertErr;
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-cream-50 p-4 shadow-sm">
      <p className="text-sm font-semibold text-espresso-800">{deal.company?.name ?? 'Company'}</p>
      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} stars`}>
            <Star
              size={22}
              className={i <= rating ? 'fill-amber-500 text-amber-500' : 'fill-espresso-100 text-espresso-100'}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="How was your experience?"
        className="mt-2 w-full rounded-xl border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
      />
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-2 flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300 disabled:opacity-60"
      >
        {busy && <Loader2 size={14} className="animate-spin" />}
        Submit Review
      </button>
    </form>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-peach-100 text-espresso-700',
    accepted: 'bg-espresso-700 text-cream-50',
    rejected: 'bg-espresso-100 text-espresso-500',
  };
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status] ?? ''}`}>
      {status}
    </span>
  );
}
