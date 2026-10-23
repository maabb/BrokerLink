import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Category } from '@/lib/types';

export function NewRequestPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories((data as Category[]) ?? []);
    });
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login', { state: { from: '/requests/new' } });
  }, [authLoading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { error: insertErr } = await supabase
        .from('service_requests')
        .insert({
          title,
          description,
          category_id: categoryId || null,
          budget: budget ? Number(budget) : null,
        })
        .select('id')
        .single();
      if (insertErr) throw insertErr;
      navigate('/dashboard/requests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || !user) return null;

  if (profile && profile.role !== 'customer') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-lg font-semibold text-espresso-800">Only customers can post service requests</p>
        <p className="mt-2 text-sm text-espresso-500">
          You are registered as a service provider. Browse open requests from your dashboard instead.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-2xl border border-espresso-100 bg-cream-50 p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-peach-100 text-espresso-600">
            <FileText size={22} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-espresso-900">Post a service request</h1>
            <p className="text-sm text-espresso-500">Describe what you need — companies will send you proposals</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-espresso-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Need a company website built"
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
            <label className="block text-sm font-medium text-espresso-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the work, timeline, and any requirements..."
              className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-espresso-700">Budget (optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 5000"
              className="mt-1 w-full rounded-lg border border-espresso-200 bg-cream-50 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-peach-100"
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-espresso-700 transition hover:-translate-y-px hover:bg-amber-300 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Publish Request
          </button>
        </form>
      </div>
    </div>
  );
}
