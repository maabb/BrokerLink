import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Category, Company } from '@/lib/types';

export function CompanyFormPage({ mode }: { mode: 'new' | 'edit' }) {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [numPartners, setNumPartners] = useState('');
  const [employeesCount, setEmployeesCount] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState('');
  const [loadingCompany, setLoadingCompany] = useState(mode === 'edit');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories((data as Category[]) ?? []);
    });
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: `/dashboard/company/${mode}` } });
  }, [authLoading, user, navigate, mode]);

  useEffect(() => {
    if (mode !== 'edit' || !user) return;
    (async () => {
      const { data } = await supabase.from('companies').select('*').eq('owner_id', user.id).maybeSingle();
      if (data) {
        const c = data as Company;
        setName(c.name);
        setDescription(c.description);
        setCategoryId(c.category_id ?? '');
        setCity(c.city);
        setCountry(c.country);
        setWebsite(c.website);
        setNumPartners(String(c.num_partners));
        setEmployeesCount(String(c.employees_count));
        setServices(c.products_services ?? []);
      }
      setLoadingCompany(false);
    })();
  }, [mode, user]);

  if (authLoading || !user || loadingCompany) return null;

  if (profile && profile.role !== 'provider') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-lg font-semibold text-espresso-800">Only service providers have company profiles</p>
        <p className="mt-2 text-sm text-espresso-500">You are registered as a customer.</p>
      </div>
    );
  }

  function addService() {
    const v = serviceInput.trim();
    if (v && !services.includes(v) && services.length < 12) {
      setServices([...services, v]);
      setServiceInput('');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const payload = {
        name,
        description,
        category_id: categoryId || null,
        city,
        country,
        website,
        num_partners: Number(numPartners) || 0,
        employees_count: Number(employeesCount) || 0,
        products_services: services,
      };
      if (mode === 'new') {
        const { error: insertErr } = await supabase.from('companies').insert(payload);
        if (insertErr) throw insertErr;
      } else {
        const { error: updateErr } = await supabase
          .from('companies')
          .update(payload)
          .eq('owner_id', user!.id);
        if (updateErr) throw updateErr;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-espresso-100 bg-cream-50 p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-peach-100 text-espresso-600">
            <Building2 size={22} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-espresso-900">
              {mode === 'new' ? 'Create your company profile' : 'Edit company profile'}
            </h1>
            <p className="text-sm text-espresso-500">
              This is what customers see when they search
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-espresso-700">Company name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-700">What you do</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe your business, experience, and what makes you great..."
              className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-espresso-700">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso-700">Country</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-espresso-700">Number of partners</label>
              <input
                type="number"
                min="0"
                value={numPartners}
                onChange={(e) => setNumPartners(e.target.value)}
                className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-espresso-700">Employees</label>
              <input
                type="number"
                min="0"
                value={employeesCount}
                onChange={(e) => setEmployeesCount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-700">Website (optional)</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-espresso-700">Products &amp; services</label>
            <div className="mt-1 flex gap-2">
              <input
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addService();
                  }
                }}
                placeholder="e.g. Mobile apps"
                className="w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
              />
              <button
                type="button"
                onClick={addService}
                className="shrink-0 rounded-lg border border-espresso-200 px-3 text-espresso-600 transition hover:bg-peach-50"
              >
                <Plus size={16} />
              </button>
            </div>
            {services.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {services.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1 rounded-full bg-peach-100 px-3 py-1 text-xs font-medium text-espresso-700"
                  >
                    {s}
                    <button type="button" onClick={() => setServices(services.filter((x) => x !== s))}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === 'new' ? 'Create Profile' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
