import { Star } from 'lucide-react';

export function Stars({ value, size = 16 }: { value: number | null; size?: number }) {
  const v = value ?? 0;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rating ${v} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(v) ? 'fill-amber-500 text-amber-500' : 'fill-espresso-100 text-espresso-100'}
        />
      ))}
    </span>
  );
}

export function RatingBadge({ avg, count }: { avg: number | null; count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Stars value={avg} size={14} />
      <span className="font-semibold text-espresso-700">{avg ? Number(avg).toFixed(1) : 'New'}</span>
      {count > 0 && <span className="text-espresso-400">({count})</span>}
    </span>
  );
}
