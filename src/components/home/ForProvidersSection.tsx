import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe,
  Inbox,
  Target,
  Trophy,
  UserPlus,
} from 'lucide-react';

const points = [
  {
    icon: Target,
    title: 'Ready-to-buy leads',
    desc: 'Requests arrive from customers who are actively searching for your category — not cold outreach to people who never asked.',
  },
  {
    icon: Globe,
    title: 'Free exposure',
    desc: 'Your company profile is public and searchable from day one, at no cost. More visibility means more inbound deals.',
  },
  {
    icon: Trophy,
    title: 'Trust that closes deals',
    desc: 'Reviews, ratings, and completed-deal counts are displayed on your profile, so new customers trust you before the first call.',
  },
  {
    icon: Inbox,
    title: 'One inbox for requests',
    desc: 'Every customer request lands in your dashboard with full details, so nothing gets lost in email threads.',
  },
  {
    icon: BarChart3,
    title: 'Stand out from competitors',
    desc: 'A complete profile with services, locations, and a strong rating ranks above sparse listings in search results.',
  },
];

const steps = [
  {
    title: 'Create your account',
    desc: 'Sign up as a service provider in under a minute — name, email, and password is all it takes.',
  },
  {
    title: 'Build your profile',
    desc: 'Describe your company, pick your category, list services, cities, and partners. A rich profile wins more requests.',
  },
  {
    title: 'Win deals',
    desc: 'Customers send requests straight to your dashboard. Respond with a proposal, close the deal, and grow your rating.',
  },
];

export function ForProvidersSection() {
  return (
    <section id="for-providers" className="scroll-mt-20 border-y border-espresso-100 bg-espresso-700 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <span className="rounded-full bg-espresso-900/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400">
              For service providers
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold text-cream-50">Be there when customers are looking</h2>
            <p className="mt-3 leading-relaxed text-peach-100">
              Every day, customers search BrokerLink for exactly what your company does. A free profile puts you in front of them, and your reviews do the selling before the first call.
            </p>
            <ul className="mt-6 space-y-3">
              {steps.map((s) => (
                <li key={s.title} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-amber-400" />
                  <div>
                    <h3 className="font-display font-semibold text-cream-50">{s.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-cream-100/90">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-espresso-700 shadow-sm transition hover:-translate-y-px hover:bg-amber-300"
            >
              <UserPlus size={16} />
              List your company free
            </Link>
          </div>
          <div className="order-1 overflow-hidden rounded-2xl shadow-xl md:order-2">
            <img
              src="https://images.pexels.com/photos/8642040/pexels-photo-8642040.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Two craftsmen reviewing plans together in their workshop"
              className="h-72 w-full object-cover md:h-[26rem]"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((b) => (
            <div key={b.title} className="rounded-2xl bg-espresso-900/40 p-6 transition hover:-translate-y-0.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/90 text-espresso-900">
                <b.icon size={20} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-cream-50">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-100/90">{b.desc}</p>
            </div>
          ))}
          <div className="flex flex-col justify-center rounded-2xl bg-amber-400 p-6">
            <p className="font-display text-xl font-semibold text-espresso-900">Your next customer is already searching.</p>
            <Link
              to="/register"
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-espresso-700 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:-translate-y-px hover:bg-espresso-900"
            >
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
