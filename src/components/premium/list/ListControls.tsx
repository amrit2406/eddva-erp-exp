import { Search, X } from 'lucide-react';

// Search input with a clear button.
export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-soft ring-1 ring-slate-200/70 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export interface SegmentOption {
  value: string;
  label: string;
  count?: number;
}

// Small segmented switch, e.g. All · Active · Inactive.
export function Segmented({ options, value, onChange, label }: { options: SegmentOption[]; value: string; onChange: (value: string) => void; label: string }) {
  return (
    <div className="inline-flex flex-wrap rounded-2xl bg-white p-1 shadow-soft ring-1 ring-slate-200/70" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${value === o.value ? 'bg-brand-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {o.label}
          {o.count !== undefined && ` · ${o.count}`}
        </button>
      ))}
    </div>
  );
}

// Colored status label; color is a hex, tinted for the background.
export function StatusPill({ label, color, title }: { label: string; color: string; title?: string }) {
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: `${color}1a`, color: color === '#94a3b8' ? '#64748b' : color }}
      title={title}
    >
      {label}
    </span>
  );
}
