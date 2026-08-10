import { Clock, CheckCircle, Info, User } from 'lucide-react';
import { cn } from '../../../../utils/cn';

interface ActivityItem {
  action: string;
  performedBy: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  className?: string;
}

export default function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  const getIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'updated':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'assigned':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'status changed':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {activities.map((activity, index) => (
        <div key={index} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="bg-slate-100 rounded-full p-2">
              {getIcon(activity.action)}
            </div>
            {index < activities.length - 1 && (
              <div className="w-0.5 h-full bg-slate-200 mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-900">{activity.action}</p>
              <p className="text-xs text-slate-500">{activity.timestamp}</p>
            </div>
            <p className="text-sm text-slate-600 mt-1">by {activity.performedBy}</p>
            {(activity.oldValue || activity.newValue) && (
              <div className="mt-2 text-sm">
                {activity.oldValue && (
                  <span className="text-slate-500 line-through mr-2">{activity.oldValue}</span>
                )}
                {activity.newValue && (
                  <span className="text-green-700">{activity.newValue}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
