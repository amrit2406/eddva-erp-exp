import { useCallback } from 'react';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getMyNotifications } from '../../api/me.api';
import type { ListParams } from '../../types/profile.types';

export default function MyNotificationsPage() {
  const load = useCallback((params: ListParams) => getMyNotifications(params), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Notifications</h1>
        <p className="text-slate-600 mt-1">Notifications for the current Alumni session</p>
      </div>

      <Card className="border-slate-200">
        <RecordPanel load={load} emptyMessage="No notifications yet" />
      </Card>
    </div>
  );
}
