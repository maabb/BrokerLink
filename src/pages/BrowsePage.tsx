import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Search, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category, Company } from '@/lib/types';
import { CategoryIcon } from '@/lib/categoryIcons';
import { RatingBadge } from '@/components/Stars';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { ForCustomersSection } from '@/components/home/ForCustomersSection';
import { ForProvidersSection } from '@/components/home/ForProvidersSection';

export function BrowsePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const showResults = Boolean(selectedCategory) || query.trim().length > 0;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const [catRes, compRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('companies')
          .select('*, category:categories(name, slug, icon)')
          .order('deal_count', { ascending: false })
          .limit(100),
      ]);
      if (!alive) return;
      setCategories((catRes.data as Category[]) ?? []);
      setCompanies((compRes.data as Company[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((c) => {
      if (selectedCategory && c.category_id !== selectedCategory) return false;
      if (!q) return true;
      const hay = [
        c.name,
        c.description,
        c.city,
        c.country,
        ...(c.products_services ?? []),
        c.category?.name ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return q.split(/\s+/).every((word) => hay.includes(word));
    });
  }, [companies, query, selectedCategory]);

  return (
    <div>
      {/* Hero + search */}
      <section className="border-b border-espresso-100 bg-gradient-to-b from-peach-50 to-cream-100">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <span className="rounded-full bg-peach-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-espresso-600">
            Discover · Trust · Connect
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-espresso-900 sm:text-5xl">
            Find the right company for the job
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-espresso-500">
            Browse verified service providers, compare real customer reviews, and get proposals — all in one place.
          </p>
          <div className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-full border border-espresso-200 bg-cream-50 p-2 shadow-sm">
            <Search size={20} className="ml-2 shrink-0 text-espresso-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for software, architecture, office rental..."
              className="w-full bg-transparent py-2 text-sm text-espresso-900 placeholder:text-espresso-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('results');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="shrink-0 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <HowItWorksSection />

      {/* For customers */}
      <ForCustomersSection />

      {/* For providers */}
      <ForProvidersSection />

      {/* Category chips */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-espresso-700 text-cream-50 shadow-sm'
                  : 'bg-cream-50 text-espresso-600 ring-1 ring-espresso-200 hover:bg-peach-50'
              }`}
            >
              <CategoryIcon icon={cat.icon} className="h-4 w-4" />
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      {showResults ? (
      <section id="results" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-espresso-900">Companies for you</h2>
          <p className="text-sm text-espresso-500">
            {loading ? 'Loading...' : `${filtered.length} compan${filtered.length === 1 ? 'y' : 'ies'}`}
          </p>
        </div>
        {loading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-peach-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-espresso-200 bg-cream-50 p-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-espresso-200" />
            <p className="mt-3 font-display text-lg font-semibold text-espresso-700">Coming soon</p>
            <p className="mt-1 text-sm text-espresso-500">New companies are joining — check back shortly.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
        )}
      </section>
      ) : (
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-4 text-center">
          <p className="text-sm text-espresso-500">
            Pick a category above or type in the search bar to see matching companies.
          </p>
        </section>
      )}
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      to={`/companies/${company.id}`}
      className="group flex flex-col rounded-2xl border border-espresso-100 bg-cream-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-peach-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-peach-100 text-espresso-600 group-hover:bg-peach-200">
          <CategoryIcon icon={company.category?.icon ?? 'briefcase'} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-semibold text-espresso-900 group-hover:text-amber-600">{company.name}</h3>
          <p className="text-xs font-medium text-espresso-500">{company.category?.name ?? 'General'}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm text-espresso-600">
        {company.description || 'No description yet.'}
      </p>

      {(company.city || company.country) && (
        <p className="mt-2 flex items-center gap-1 text-xs text-espresso-500">
          <MapPin size={13} />
          {[company.city, company.country].filter(Boolean).join(', ')}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-espresso-100 pt-3">
        <RatingBadge avg={company.avg_rating} count={company.review_count} />
        <div className="flex items-center gap-3 text-xs text-espresso-400">
          <span className="flex items-center gap-1" title="Completed deals">
            <TrendingUp size={13} />
            {company.deal_count}
          </span>
          <span className="flex items-center gap-1" title="Partners">
            <Users size={13} />
            {company.num_partners}
          </span>
        </div>
      </div>
    </Link>
  );
}
