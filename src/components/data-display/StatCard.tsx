import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

// Fixed status palette (never themed) — reserved for state, never reused as a
// decorative/categorical color. Values from the dataviz skill's reference palette.
const STATUS_COLOR: Record<'good' | 'warning' | 'serious' | 'critical', string> = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  // Short caption under the value, e.g. "2 of 3 books" or "Needs attention".
  hint?: string;
  // Status colors the value + icon and never stands for meaning alone — the
  // label stays in normal ink so nothing depends on color to be understood.
  status?: 'good' | 'warning' | 'serious' | 'critical';
}

export default function StatCard({ label, value, icon: Icon, hint, status }: StatCardProps) {
  const statusColor = status ? STATUS_COLOR[status] : undefined;
  const StatusIcon = status === 'good' ? CheckCircle2 : status ? AlertTriangle : undefined;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        {label}
      </div>
      <div className="mt-1 flex items-center gap-1.5">
        {StatusIcon && <StatusIcon className="h-4 w-4 flex-shrink-0" style={{ color: statusColor }} />}
        <span className="text-2xl font-semibold text-slate-900 break-words tabular-nums" style={statusColor ? { color: statusColor } : undefined}>
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </span>
      </div>
      {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
