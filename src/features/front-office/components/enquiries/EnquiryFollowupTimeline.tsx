import { Clock } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import type { FrontOfficeEnquiryFollowup } from '../../types/enquiryRecord.types';

interface EnquiryFollowupTimelineProps {
  followups: FrontOfficeEnquiryFollowup[];
  className?: string;
}

export default function EnquiryFollowupTimeline({ followups, className }: EnquiryFollowupTimelineProps) {
  if (followups.length === 0) {
    return (
      <div className={cn('text-center py-8 text-slate-500', className)}>
        No follow-ups recorded yet.
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {followups.map((followup) => (
        <div key={followup.followup_id} className="relative pl-8 pb-4 border-l-2 border-slate-200 last:border-0">
          <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-900">
                {new Date(followup.followup_date).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-slate-600">{followup.notes}</p>
            {followup.next_followup_date && (
              <p className="text-xs text-slate-500">
                Next follow-up: {new Date(followup.next_followup_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
