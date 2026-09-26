import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';

export interface TrackerStep {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  date?: string | null;
}

// Steps done (ticked), the current one (outlined), the rest (grey), and an
// optional stop marker when the record left the normal path.
export default function StatusTracker({ steps, current, stop }: { steps: TrackerStep[]; current: number; stop?: TrackerStep }) {
  const shown = stop ? steps.slice(0, current + 1) : steps;
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0">
      {shown.map((step, index) => {
        const done = Boolean(stop) || index < current;
        const isCurrent = !stop && index === current;
        const last = index === shown.length - 1 && !stop;
        const Icon = step.icon;
        return (
          <li key={step.key} className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center">
            {!last && (
              <span aria-hidden className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 sm:left-1/2 sm:top-[15px] sm:h-0.5 sm:w-full" style={{ background: done ? step.color : '#e2e8f0' }} />
            )}
            <span
              className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-white"
              style={done ? { background: step.color, color: '#fff' } : isCurrent ? { background: '#fff', color: step.color, boxShadow: `inset 0 0 0 2px ${step.color}` } : { background: '#f1f5f9', color: '#94a3b8' }}
            >
              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span className="min-w-0 sm:mt-2 sm:px-1">
              <span className={`block text-sm ${isCurrent ? 'font-semibold text-slate-900' : done ? 'font-medium text-slate-700' : 'text-slate-400'}`}>{step.label}</span>
              <span className="block text-[11px] text-slate-400">{step.date ?? (isCurrent ? 'Now' : '')}</span>
            </span>
          </li>
        );
      })}
      {stop && (
        <li className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center">
          <span className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white ring-4 ring-white" style={{ background: stop.color }}>
            <stop.icon className="h-4 w-4" />
          </span>
          <span className="sm:mt-2">
            <span className="block text-sm font-semibold" style={{ color: stop.color }}>
              {stop.label}
            </span>
            <span className="block text-[11px] text-slate-400">{stop.date ?? ''}</span>
          </span>
        </li>
      )}
    </ol>
  );
}
