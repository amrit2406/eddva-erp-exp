import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getNotifications } from '../../api/hostel.api';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notification Log</h1>
        <p className="text-slate-600 mt-1">Messages the hostel system has sent, and whether they went through</p>
      </div>

      <Card className="border-slate-200">
        <RecordPanel load={getNotifications} emptyMessage="No notifications have been sent yet" />
      </Card>
    </div>
  );
}
