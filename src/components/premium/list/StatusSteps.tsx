import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

export interface StatusStep {
  key: string;
  label: string;
  // Plain-language meaning, shown under the label.
  hint: string;
  icon: LucideIcon;
  color: string;
  count: number;
}

interface StatusStepsProps {
  // The normal path a record moves through, left to right.
  steps: StatusStep[];
  // Side outcomes that leave the path (rejected, cancelled…).
  exits?: StatusStep[];
  total: number;
  active: string | null;
  onSelect: (key: string | null) => void;
}

// The record's journey as clickable steps — doubles as the status filter,
// so people learn what each status means while filtering by it.
export default function StatusSteps({ steps, exits = [], total, active, onSelect }: StatusStepsProps) {
  const chip = (step: StatusStep, withArrow: boolean) => {
    const selected = active === step.key;
    const Icon = step.icon;
    return (
      <div key={step.key} className="flex items-center">
        <button
          type="button"
          onClick={() => onSelect(selected ? null : step.key)}
          aria-pressed={selected}
          className={`group flex min-w-[150px] flex-1 items-center gap-3 rounded-2xl px-3.5 py-3 text-left ring-1 transition-all ${
            selected ? 'bg-white shadow-lift ring-2' : 'bg-slate-50/80 ring-slate-100 hover:bg-white hover:shadow-soft hover:ring-slate-200'
          }`}
          style={selected ? { boxShadow: `0 0 0 2px ${step.color}` } : undefined}
        >
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${step.color}1a` }}>
            <Icon className="h-[18px] w-[18px]" style={{ color: step.color }} />
          </span>
          <span className="min-w-0">
            <span className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight text-slate-900 tabular-nums">{step.count}</span>
              <span className="truncate text-sm font-medium text-slate-700">{step.label}</span>
            </span>
            <span className="block truncate text-[11px] text-slate-500">{step.hint}</span>
          </span>
        </button>
        {withArrow && <ChevronRight aria-hidden className="mx-1 hidden h-4 w-4 flex-shrink-0 text-slate-300 xl:block" />}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">How an order moves</p>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            active === null ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All · {total}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:items-stretch gap-2 xl:gap-0">
        {steps.map((step, index) => chip(step, index < steps.length - 1))}
      </div>
      {exits.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500">Stopped:</span>
          {exits.map((step) => {
            const selected = active === step.key;
            const Icon = step.icon;
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => onSelect(selected ? null : step.key)}
                aria-pressed={selected}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                  selected ? 'bg-white text-slate-900' : 'bg-slate-50 text-slate-600 ring-slate-200 hover:bg-white'
                }`}
                style={selected ? { boxShadow: `0 0 0 2px ${step.color}` } : undefined}
                title={step.hint}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: step.color }} />
                {step.label} · {step.count}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
