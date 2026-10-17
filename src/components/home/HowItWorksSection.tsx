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

export function HowItWorksSection() {
  return (
    <section className="border-y border-espresso-100 bg-espresso-700 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-3xl font-semibold text-cream-50">How it works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-peach-100">From search to signed deal in three steps.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl bg-espresso-900/40 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 font-display text-lg font-bold text-espresso-900">
                {i + 1}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-cream-50">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-100/90">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
