import { useState } from 'react';

const SPINES = ['#0a4a9c', '#15936a', '#7c3aed', '#c98500', '#d55181', '#0891b2'];

// Cover photo, or a coloured "spine" with the title's initials when there's none.
export default function BookCover({ src, title, size = 'md' }: { src?: string | null; title: string; size?: 'sm' | 'md' | 'lg' }) {
  const [broken, setBroken] = useState(false);
  const box = { sm: 'h-10 w-7 rounded text-[9px]', md: 'h-14 w-10 rounded-md text-xs', lg: 'h-40 w-28 rounded-xl text-2xl' }[size];
  if (src && !broken) {
    return <img src={src} alt={`Cover of ${title}`} loading="lazy" onError={() => setBroken(true)} className={`flex-shrink-0 object-cover shadow-sm ring-1 ring-slate-200 ${box}`} />;
  }
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const color = SPINES[[...title].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % SPINES.length];
  return (
    <span
      aria-hidden
      className={`relative flex flex-shrink-0 items-center justify-center overflow-hidden font-bold text-white shadow-sm ${box}`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-black/15" />
      {initials || '?'}
    </span>
  );
}
