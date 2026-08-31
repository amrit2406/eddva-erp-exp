import { MessageSquare, ArrowUpCircle, RefreshCw, UserCog, Flag } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeComplaintUpdate } from '../../types/complaintRecord.types';

interface ComplaintTimelineProps {
  updates: FrontOfficeComplaintUpdate[];
  className?: string;
}

const TYPE_ICON: Record<string, typeof MessageSquare> = {
  status_change: RefreshCw,
  escalated: ArrowUpCircle,
  escalate: ArrowUpCircle,
  assigned: UserCog,
  priority_change: Flag,
};

const TYPE_COLOR: Record<string, string> = {
  status_change: 'bg-blue-500',
  escalated: 'bg-orange-500',
  escalate: 'bg-orange-500',
  assigned: 'bg-purple-500',
  priority_change: 'bg-amber-500',
};

export default function ComplaintTimeline({ updates, className }: ComplaintTimelineProps) {
  if (updates.length === 0) {
    return (
      <div className={cn('text-center py-8 text-slate-500', className)}>
        No updates recorded yet.
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {updates.map((update) => {
        const type = update.status_change || 'note';
        const Icon = TYPE_ICON[type] || MessageSquare;
        const color = TYPE_COLOR[type] || 'bg-slate-500';
        return (
          <div key={update.update_id} className="relative pl-8 pb-4 border-l-2 border-slate-200 last:border-0">
            <div className={cn('absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white', color)} />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-900">
                  {new Date(update.updated_at).toLocaleString()}
                </span>
                {update.status_change && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                    {update.status_change.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">{update.notes}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
