import { cn } from '../../../../utils/cn';

export interface RankedBarItem {
  label: string;
  count: number;
  color?: string;
}

interface RankedBarListProps {
  items: RankedBarItem[];
  emptyText?: string;
  className?: string;
}

const DEFAULT_COLOR = '#008BE9';

export default function RankedBarList({ items, emptyText = 'No data yet.', className }: RankedBarListProps) {
  if (items.length === 0) {
    return <div className={cn('text-sm text-slate-400 py-4 text-center', className)}>{emptyText}</div>;
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between gap-2 text-sm mb-1">
            <span className="text-slate-700 capitalize truncate">{item.label}</span>
            <span className="font-semibold text-slate-900 flex-shrink-0">{item.count}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-r-full"
              style={{
                width: `${Math.max((item.count / max) * 100, 4)}%`,
                backgroundColor: item.color || DEFAULT_COLOR,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
