import { Link } from 'react-router-dom';
import { AlertOctagon, AlertTriangle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import type { AttentionItem, Severity } from '../utils/attention';

// Status colors are reserved for state and always paired with an icon + text.
const SEVERITY: Record<Severity, { color: string; tint: string; label: string; icon: typeof AlertTriangle }> = {
  critical: { color: '#d03b3b', tint: 'rgb(208 59 59 / 0.08)', label: 'Critical', icon: AlertOctagon },
  warning: { color: '#c98500', tint: 'rgb(250 178 25 / 0.12)', label: 'Warning', icon: AlertTriangle },
};

// How many modules are free of open items — pinned to the bottom of the card.
function HealthFooter({ items, moduleCount }: { items: AttentionItem[]; moduleCount: number }) {
  if (moduleCount === 0) return null;
  const flagged = new Set(items.map((item) => item.module.replace(/^(Sales|Purchase)$/, 'Sales & Purchase'))).size;
  const healthy = Math.max(0, moduleCount - flagged);
  const pct = (healthy / moduleCount) * 100;

  return (
    <div className="mt-4 rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-slate-600">Module health</span>
        <span className="text-slate-500">
          <span className="font-semibold text-slate-900 tabular-nums">{healthy}</span> of {moduleCount} with no open items
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-200/70 overflow-hidden" role="meter" aria-label="Module health" aria-valuemin={0} aria-valuemax={moduleCount} aria-valuenow={healthy}>
        <div className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AttentionList({ items, moduleCount }: { items: AttentionItem[]; moduleCount: number }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 min-h-48 flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
            <ShieldCheck className="h-6 w-6" style={{ color: '#0ca30c' }} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">All clear</p>
            <p className="text-xs text-slate-500">Nothing needs attention right now</p>
          </div>
        </div>
        <HealthFooter items={items} moduleCount={moduleCount} />
      </div>
    );
  }

  const counts = { critical: 0, warning: 0 };
  items.forEach((item) => (counts[item.severity] += 1));

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="mb-3 flex gap-2">
        {(Object.keys(counts) as Severity[])
          .filter((severity) => counts[severity] > 0)
          .map((severity) => {
            const { color, tint, label, icon: Icon } = SEVERITY[severity];
            return (
              <span
                key={severity}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-slate-700"
                style={{ background: tint }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color }} />
                {counts[severity]} {label}
              </span>
            );
          })}
      </div>

      {/* On desktop the list fills whatever height the grid row gives the card
          and scrolls inside it, so the card never grows past its neighbours. */}
      <div className="relative flex-1 min-h-[260px]">
        <ul className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 -mr-1 lg:absolute lg:inset-0 lg:max-h-none">
          {items.map((item) => {
            const { color, tint, icon: Icon } = SEVERITY[item.severity];
            return (
              <li key={`${item.module}-${item.label}`}>
                <Link
                  to={item.to}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-transparent transition-all hover:bg-slate-50 hover:ring-slate-200"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: tint }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.label}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.module}
                      {item.detail && ` · ${item.detail}`}
                    </p>
                  </div>
                  {!item.hideCount && (
                    <span className="min-w-[28px] rounded-lg bg-slate-100 px-2 py-0.5 text-center text-sm font-semibold text-slate-900 tabular-nums">
                      {item.count}
                    </span>
                  )}
                  <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <HealthFooter items={items} moduleCount={moduleCount} />
    </div>
  );
}
