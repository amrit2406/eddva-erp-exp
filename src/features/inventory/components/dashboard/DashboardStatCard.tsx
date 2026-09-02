import type { LucideIcon } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { cn } from '../../../../utils/cn';

const COLOR_MAP = {
  blue: { bg: 'bg-[#008BE9]/10', text: 'text-[#008BE9]' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
} as const;

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: keyof typeof COLOR_MAP;
  className?: string;
}

export default function DashboardStatCard({ label, value, icon: Icon, color = 'blue', className }: DashboardStatCardProps) {
  const c = COLOR_MAP[color];
  return (
    <Card className={cn('border-slate-200', className)}>
      <div className="p-4 flex items-center gap-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', c.bg)}>
          <Icon className={cn('h-5 w-5', c.text)} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium leading-tight">{label}</p>
          <p className="text-xl font-bold text-slate-900 truncate">{value}</p>
        </div>
      </div>
    </Card>
  );
}
