// Shared class strings for the simple module pages (forms, buttons, cards).

export const inputClass =
  'w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-slate-50 disabled:text-slate-500';

export const cardClass = 'rounded-3xl bg-white p-5 sm:p-6 shadow-soft ring-1 ring-slate-200/70';

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-navy to-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110 disabled:opacity-60';

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60';

export const btnQuietDanger =
  'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60';

export const shortDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const longDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
