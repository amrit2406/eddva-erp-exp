import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getNotifications } from '../../api/notifications.api';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-600 mt-1">System notifications for the alumni module</p>
      </div>

      <Card className="border-slate-200">
        <RecordPanel load={getNotifications} emptyMessage="No notifications yet" />
      </Card>
    </div>
  );
}
