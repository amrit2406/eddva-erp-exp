import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ListHeaderProps {
  icon: LucideIcon;
  title: string;
  // One plain-language sentence: what this page is for.
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
}

// Light brand header for list pages: icon badge, title, plain description, actions.
export default function ListHeader({ icon: Icon, title, description, actions, children }: ListHeaderProps) {
  return (
    <div className="animate-rise relative overflow-hidden rounded-3xl bg-white p-5 sm:p-6 shadow-soft ring-1 ring-slate-200/70">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy to-brand shadow-md shadow-brand/25">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="relative mt-5">{children}</div>}
    </div>
  );
}
