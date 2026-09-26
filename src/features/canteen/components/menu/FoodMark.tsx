import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { foodTypeInfo } from '../../utils/labels';

// The familiar Indian food mark: a colored square with a dot, plus the word.
export function FoodMark({ type, withLabel = false }: { type: string; withLabel?: boolean }) {
  const info = foodTypeInfo(type);
  return (
    <span className="inline-flex items-center gap-1.5" title={info.label}>
      <span className="inline-flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-[3px] border-[1.5px]" style={{ borderColor: info.color }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: info.color }} />
      </span>
      {withLabel && <span className="text-xs font-medium text-slate-600">{info.label}</span>}
    </span>
  );
}

// Item photo, or a soft placeholder when there's none or it fails to load.
export function ItemThumb({ src, alt, size = 'md' }: { src?: string | null; alt: string; size?: 'sm' | 'md' | 'lg' }) {
  const [broken, setBroken] = useState(false);
  const box = { sm: 'h-9 w-9 rounded-lg', md: 'h-11 w-11 rounded-xl', lg: 'h-24 w-24 rounded-2xl' }[size];
  if (!src || broken) {
    return (
      <span className={`flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-brand/10 to-brand-navy/10 text-brand-navy/60 ${box}`}>
        <UtensilsCrossed className={size === 'lg' ? 'h-8 w-8' : 'h-4 w-4'} />
      </span>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} className={`flex-shrink-0 object-cover ring-1 ring-slate-200 ${box}`} />;
}
