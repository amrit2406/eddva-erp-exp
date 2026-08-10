import { Phone, Mail, User, Video } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface Followup {
  id: string;
  followUpDate: string;
  method: string;
  result?: string;
  notes?: string;
  nextFollowUpDate?: string;
  createdBy?: string;
}

interface EnquiryFollowupTimelineProps {
  followups: Followup[];
  className?: string;
}

const methodIcons: Record<string, any> = {
  phone: Phone,
  email: Mail,
  in_person: User,
  video_call: Video,
};

export default function EnquiryFollowupTimeline({ followups, className }: EnquiryFollowupTimelineProps) {
  if (followups.length === 0) {
    return (
      <div className={cn('text-center py-8 text-slate-500', className)}>
        No follow-ups recorded yet
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {followups.map((followup) => {
        const Icon = methodIcons[followup.method] || Phone;
        return (
          <div key={followup.id} className="relative pl-8 pb-4 border-l-2 border-slate-200 last:border-0">
            <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-900">
                  {new Date(followup.followUpDate).toLocaleString()}
                </span>
                {followup.result && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                    {followup.result.replace('_', ' ')}
                  </span>
                )}
              </div>
              {followup.notes && (
                <p className="text-sm text-slate-600">{followup.notes}</p>
              )}
              {followup.nextFollowUpDate && (
                <p className="text-xs text-slate-500">
                  Next follow-up: {new Date(followup.nextFollowUpDate).toLocaleDateString()}
                </p>
              )}
              {followup.createdBy && (
                <p className="text-xs text-slate-400">Added by {followup.createdBy}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
