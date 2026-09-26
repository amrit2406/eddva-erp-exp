import type { ComponentType, ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cardClass } from '../styles';

type IconType = ComponentType<{ className?: string }>;

// Top card on a details page: icon, title, status, a meta line and actions.
export function DetailHeader({
  icon: Icon,
  title,
  status,
  meta,
  actions,
  accent,
  children,
}: {
  icon: IconType;
  title: string;
  status?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  // Optional colored top edge (e.g. the status color).
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <section className="animate-rise relative overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70">
      {accent && <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy to-brand shadow-md shadow-brand/25">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
                {status}
              </div>
              {meta && <div className="mt-0.5 text-sm text-slate-500">{meta}</div>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  );
}

// "What this means / what's next" note in plain words.
export function NextStep({ tone = 'info', children }: { tone?: 'info' | 'good' | 'bad'; children: ReactNode }) {
  const style = {
    info: { background: 'rgb(0 139 233 / 0.07)', color: '#0a4a9c' },
    good: { background: 'rgb(12 163 12 / 0.07)', color: '#166534' },
    bad: { background: 'rgb(208 59 59 / 0.07)', color: '#991b1b' },
  }[tone];
  return (
    <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm" style={style}>
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}

// A titled card of label/value rows.
export function InfoCard({ title, icon: Icon, action, rows, children, delay = 0 }: { title: string; icon?: IconType; action?: ReactNode; rows?: [string, ReactNode][]; children?: ReactNode; delay?: number }) {
  return (
    <section className={`animate-rise ${cardClass}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-brand-navy/10 ring-1 ring-brand/15">
              <Icon className="h-4 w-4 text-brand-navy" />
            </div>
          )}
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
        </div>
        {action}
      </div>
      {rows && rows.length > 0 && (
        <dl className="divide-y divide-slate-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2">
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="text-right text-sm font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </section>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-5 w-36 rounded" />
      <div className="skeleton h-32 rounded-3xl" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="skeleton h-64 rounded-3xl lg:col-span-2" />
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    </div>
  );
}
