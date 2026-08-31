import { toDateInputValue } from '../../utils/dateTime';
import { cn } from '../../../../utils/cn';
import type { VisitorsByDay } from '../../types/dashboardRecord.types';

interface DailyTrendChartProps {
  data: VisitorsByDay[];
  className?: string;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatShortDate(isoDate: string): string {
  const datePart = toDateInputValue(isoDate);
  if (!datePart) return '—';
  const [, month, day] = datePart.split('-');
  return `${MONTH_LABELS[Number(month) - 1]} ${Number(day)}`;
}

export default function DailyTrendChart({ data, className }: DailyTrendChartProps) {
  if (data.length === 0) {
    return <div className={cn('text-sm text-slate-400 py-8 text-center', className)}>No visits recorded yet.</div>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className={cn('flex items-end gap-3 h-32', className)}>
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-slate-900">{d.count}</span>
          <div
            className="w-full max-w-[28px] rounded-t-sm bg-[#008BE9]"
            style={{ height: `${Math.max((d.count / max) * 100, 6)}%` }}
          />
          <span className="text-xs text-slate-500 truncate">{formatShortDate(d.day)}</span>
        </div>
      ))}
    </div>
  );
}
