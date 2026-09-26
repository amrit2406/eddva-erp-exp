import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { SearchX } from 'lucide-react';

// Friendly first-run state: what this is, and the one thing to do next.
export function EmptyState({ icon: Icon, title, message, action }: { icon: LucideIcon; title: string; message: string; action?: ReactNode }) {
  return (
    <div className="animate-rise flex flex-col items-center justify-center rounded-3xl bg-white px-6 py-14 text-center shadow-soft ring-1 ring-slate-200/70">
      <div className="relative">
        <div aria-hidden className="absolute inset-0 -m-3 rounded-full bg-brand/10 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-navy to-brand shadow-lg shadow-brand/25">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// Filters/search matched nothing — offer the way back.
export function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-12 text-center">
      <SearchX className="h-8 w-8 text-slate-300" />
      <p className="mt-3 text-sm font-medium text-slate-700">Nothing matches your search or filter</p>
      <button type="button" onClick={onClear} className="mt-3 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
        Clear search and filter
      </button>
    </div>
  );
}

// Placeholder rows shaped like the real ones.
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70">
          <div className="skeleton h-11 w-11 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-40 rounded" />
            <div className="skeleton h-3 w-64 rounded" />
          </div>
          <div className="skeleton hidden h-6 w-24 rounded-full sm:block" />
          <div className="skeleton hidden h-5 w-20 rounded md:block" />
        </div>
      ))}
    </div>
  );
}
