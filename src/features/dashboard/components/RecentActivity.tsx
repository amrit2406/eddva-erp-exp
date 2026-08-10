import Card from '../../../components/ui/Card';
import { formatDateTime } from '../../../utils/formatDate';
import type { RecentActivityItem } from '../index';
import { Clock, User, DollarSign, FileText, CheckCircle } from 'lucide-react';

const activityIcons: Record<string, React.ElementType> = {
  student: User,
  teacher: User,
  fee: DollarSign,
  exam: FileText,
  attendance: CheckCircle,
};

export default function RecentActivity({ activities }: { activities: RecentActivityItem[] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <Clock className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Icon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(activity.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
