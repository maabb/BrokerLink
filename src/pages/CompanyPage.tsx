import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Globe, MapPin, Star, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Company, Review } from '@/lib/types';
import { CategoryIcon } from '@/lib/categoryIcons';
import { Stars } from '@/components/Stars';
import { useAuth } from '@/lib/auth';

export function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      const [compRes, revRes] = await Promise.all([
        supabase.from('companies').select('*, category:categories(name, slug, icon)').eq('id', id).maybeSingle(),
        supabase
          .from('reviews')
          .select('*, customer:profiles!reviews_customer_id_fkey(full_name)')
          .eq('company_id', id)
          .order('created_at', { ascending: false }),
      ]);
      if (!alive) return;
      if (compRes.error || !compRes.data) setNotFound(true);
      else setCompany(compRes.data as Company);
      setReviews((revRes.data as Review[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-40 animate-pulse rounded-2xl bg-peach-100" />
        <div className="mt-4 h-64 animate-pulse rounded-2xl bg-peach-100" />
      </div>
    );
  }

  if (notFound || !company) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg font-semibold text-espresso-700">Company not found</p>
        <Link to="/" className="mt-2 inline-block text-sm font-semibold text-amber-600 hover:text-amber-500">
          Back to search
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === company.owner_id;
  const dist = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1] += 1;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/" className="text-sm font-medium text-espresso-500 hover:text-espresso-700">
        ← Back to search
      </Link>

      {/* Header card */}
      <div className="mt-3 rounded-2xl border border-espresso-100 bg-cream-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-peach-100 text-espresso-600">
            <CategoryIcon icon={company.category?.icon ?? 'briefcase'} className="h-8 w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-semibold text-espresso-900">{company.name}</h1>
              {isOwner && (
                <Link
                  to="/dashboard/company/edit"
                  className="rounded-full bg-peach-100 px-3 py-1 text-xs font-semibold text-espresso-700 hover:bg-peach-200"
                >
                  Edit profile
                </Link>
              )}
            </div>
            <p className="text-sm font-medium text-espresso-500">{company.category?.name ?? 'General'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-espresso-600">
              <Stars value={company.avg_rating} />
              <span className="font-semibold text-espresso-800">
                {company.avg_rating ? Number(company.avg_rating).toFixed(1) : 'New'}
              </span>
              <span className="text-espresso-400">({company.review_count} reviews)</span>
              <span className="flex items-center gap-1">
                <TrendingUp size={14} /> {company.deal_count} deals completed
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} /> {company.num_partners} partners
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-espresso-500">
              {(company.city || company.country) && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {[company.city, company.country].filter(Boolean).join(', ')}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-amber-600 hover:text-amber-500"
                >
                  <Globe size={14} />
                  Website
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate('/requests/new', { state: { companyId: company.id } })}
            className="shrink-0 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-espresso-700 shadow-sm transition hover:-translate-y-px hover:bg-amber-300"
          >
            Request a Proposal
          </button>
        </div>

        {company.description && <p className="mt-4 leading-relaxed text-espresso-600">{company.description}</p>}

        {company.products_services?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-espresso-700">Products &amp; Services</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {company.products_services.map((s, i) => (
                <span key={i} className="rounded-full bg-peach-50 px-3 py-1 text-xs font-medium text-espresso-600">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-espresso-100 bg-cream-50 p-6 shadow-sm lg:col-span-1">
          <h2 className="font-semibold text-espresso-900">Rating breakdown</h2>
          <div className="mt-3">
            <Stars value={company.avg_rating} />
          </div>
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-xs text-espresso-500">
                <span className="flex w-8 items-center gap-0.5">
                  {star} <Star size={11} className="fill-amber-500 text-amber-500" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-espresso-100">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{
                      width: `${reviews.length ? (dist[star - 1] / reviews.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-4 text-right">{dist[star - 1]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="font-semibold text-espresso-900">
            Reviews {reviews.length > 0 && <span className="text-espresso-400">({reviews.length})</span>}
          </h2>
          {reviews.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-8 text-center">
              <p className="text-sm text-espresso-500">No reviews yet. Be the first after completing a deal.</p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-espresso-100 bg-cream-50 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-peach-100 text-sm font-bold text-espresso-600">
                        {(r.customer?.full_name || 'C').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-espresso-800">{r.customer?.full_name || 'Customer'}</p>
                        <Stars value={r.rating} size={12} />
                      </div>
                    </div>
                    <span className="text-xs text-espresso-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && <p className="mt-3 text-sm leading-relaxed text-espresso-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
