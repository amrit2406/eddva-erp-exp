import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';

interface KpiTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  // Decorative identity color for the tile; the label carries the meaning.
  accent: string;
  style?: CSSProperties;
}

// Headline number with its own accent glow; lifts slightly on hover.
export default function KpiTile({ label, value, icon: Icon, hint, accent, style }: KpiTileProps) {
  return (
    <div
      className="animate-rise group relative overflow-hidden rounded-3xl bg-white p-4 sm:p-5 shadow-soft ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
      style={style}
    >
      {/* Accent glow + ring doodle in the corner. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl opacity-40 transition-opacity duration-300 group-hover:opacity-70"
        style={{ background: accent }}
      />
      <svg aria-hidden className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 opacity-[0.12]" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="none" stroke={accent} strokeWidth="6" />
        <circle cx="50" cy="50" r="30" fill="none" stroke={accent} strokeWidth="6" />
      </svg>

      <div className="relative flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}b3)`, boxShadow: `0 6px 16px -6px ${accent}` }}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
        <p className="text-xs sm:text-sm font-medium text-slate-500 leading-tight">{label}</p>
      </div>
      <p className="relative mt-3 text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 tabular-nums break-words">
        {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
      </p>
      {hint && (
        <p className="relative mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium text-slate-600" style={{ background: `${accent}14` }}>
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: accent }} />
          <span className="truncate">{hint}</span>
        </p>
      )}
    </div>
  );
}
