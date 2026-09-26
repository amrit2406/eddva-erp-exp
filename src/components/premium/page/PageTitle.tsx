import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageTitleProps {
  back?: { to: string; label: string };
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

// Back link + plain title + one short line — the header for form and detail pages.
export default function PageTitle({ back, title, subtitle, actions }: PageTitleProps) {
  return (
    <div className="space-y-3">
      {back && (
        <Link to={back.to} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
          <ArrowLeft className="h-4 w-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
