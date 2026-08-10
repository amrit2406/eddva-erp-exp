import { MessageSquare, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface TimelineEntry {
  id: string;
  date: string;
  type: 'created' | 'assigned' | 'updated' | 'resolved' | 'closed';
  description: string;
  createdBy?: string;
}

interface ComplaintTimelineProps {
  entries: TimelineEntry[];
  className?: string;
}

const typeIcons: Record<string, any> = {
  created: MessageSquare,
  assigned: AlertCircle,
  updated: Clock,
  resolved: CheckCircle,
  closed: CheckCircle,
};

const typeColors: Record<string, string> = {
  created: 'bg-blue-500',
  assigned: 'bg-orange-500',
  updated: 'bg-slate-500',
  resolved: 'bg-green-500',
  closed: 'bg-slate-700',
};

export default function ComplaintTimeline({ entries, className }: ComplaintTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className={cn('text-center py-8 text-slate-500', className)}>
        No activity recorded yet
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {entries.map((entry) => {
        const Icon = typeIcons[entry.type] || MessageSquare;
        return (
          <div key={entry.id} className="relative pl-8 pb-4 border-l-2 border-slate-200 last:border-0">
            <div className={cn('absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white', typeColors[entry.type])} />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-900">
                  {new Date(entry.date).toLocaleString()}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                  {entry.type}
                </span>
              </div>
              <p className="text-sm text-slate-600">{entry.description}</p>
              {entry.createdBy && (
                <p className="text-xs text-slate-400">By {entry.createdBy}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
