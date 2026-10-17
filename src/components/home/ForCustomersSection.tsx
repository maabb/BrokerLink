import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BadgeCheck,
  ChevronDown,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Wallet,
} from 'lucide-react';

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Verified providers only',
    desc: 'Every company on BrokerLink is reviewed before it appears in search, so you never gamble on an unknown contact.',
  },
  {
    icon: Star,
    title: 'Real reviews, real ratings',
    desc: 'Ratings come from customers who actually completed a deal, not paid promotions. You see the full picture.',
  },
  {
    icon: BadgeCheck,
    title: 'Proven track record',
    desc: 'Completed deals and partner counts are shown on every profile, so you can tell an established firm from a newcomer.',
  },
  {
    icon: Wallet,
    title: 'Free to ask',
    desc: 'Sending a request costs nothing and carries no obligation. Compare the proposals and pick the best fit.',
  },
  {
    icon: Clock,
    title: 'Fast responses',
    desc: 'Providers are notified the moment you send a request, and most respond within one business day.',
  },
  {
    icon: MapPin,
    title: 'Local and remote',
    desc: 'Filter by city and country to find providers near you, or work with the best team wherever they are.',
  },
];

const steps = [
  {
    title: 'Search',
    desc: 'Browse by category or search for exactly what you need — software, architecture, office rental and more.',
  },
  {
    title: 'Compare',
    desc: 'Open company profiles to read reviews, check ratings, and see completed deals and services offered.',
  },
  {
    title: 'Request and choose',
    desc: 'Send one request describing your project, receive proposals, and choose the company that fits best.',
  },
];

const faqs = [
  {
    q: 'Does it cost anything to use BrokerLink?',
    a: 'No. Searching, reading reviews, and sending requests are completely free for customers. You only ever pay the company you hire, directly.',
  },
  {
    q: 'How do I know a company is trustworthy?',
    a: 'Each profile shows verified reviews from real customers, an average rating, the number of completed deals, and the services the company offers — so you can decide with the full picture.',
  },
  {
    q: 'What happens after I send a request?',
    a: 'The companies that match your category are notified immediately. They respond with a proposal, which you can compare against others before committing to anything.',
  },
  {
    q: 'Can I request something very specific?',
    a: 'Yes. A request is free-form: describe your project, timeline, and budget in your own words, and providers answer with a tailored proposal.',
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-8 space-y-3">
      {faqs.map((f, i) => (
        <div key={f.q} className="overflow-hidden rounded-2xl border border-espresso-100 bg-cream-50">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
          >
            <span className="font-medium text-espresso-900">{f.q}</span>
            <ChevronDown size={18} className={`shrink-0 text-espresso-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
          </button>
          {open === i && <p className="px-6 pb-5 text-sm leading-relaxed text-espresso-500">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

export function ForCustomersSection() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash !== '#for-customers') return;
    document.getElementById('for-customers')?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <section id="for-customers" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <span className="rounded-full bg-peach-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-espresso-600">
            For customers
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-espresso-900">Hire with confidence, not guesswork</h2>
          <p className="mt-3 leading-relaxed text-espresso-500">
            Stop picking from a pile of search results. BrokerLink shows you verified providers with honest reviews and a proven history — then lets you hear from several of them before you commit.
          </p>
          <ol className="mt-6 space-y-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-espresso-700 font-display text-sm font-bold text-cream-50">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-espresso-900">{s.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-espresso-500">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <a
            href="#results"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-espresso-700 shadow-sm transition hover:-translate-y-px hover:bg-amber-300"
          >
            <Search size={16} />
            Browse companies
          </a>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-lg">
          <img
            src="https://images.pexels.com/photos/5691550/pexels-photo-5691550.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="A service provider at work in a customer's home"
            className="h-72 w-full object-cover md:h-[26rem]"
            loading="lazy"
          />
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="rounded-2xl border border-espresso-100 bg-cream-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-peach-300 hover:shadow-md"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-peach-100 text-espresso-600">
              <b.icon size={20} />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-espresso-900">{b.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-espresso-500">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-3xl">
        <h3 className="text-center font-display text-2xl font-semibold text-espresso-900">Customer questions</h3>
        <Faq />
      </div>
    </section>
  );
}
