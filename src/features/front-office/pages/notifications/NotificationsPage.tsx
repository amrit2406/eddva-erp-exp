import { useEffect, useState } from 'react';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import Input from '../../../../components/ui/Input';
import { getNotifications } from '../../api/notifications.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import NotificationTable from '../../components/notifications/NotificationTable';
import type { FrontOfficeNotification, NotificationEntityType } from '../../types/notification.types';

const ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'All Entities' },
  { value: 'visitor', label: 'Visitor' },
  { value: 'enquiry', label: 'Enquiry' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'complaint', label: 'Complaint' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<FrontOfficeNotification[]>([]);
  const [entityType, setEntityType] = useState<NotificationEntityType | ''>('');
  const [entityId, setEntityId] = useState('');
  const [recipientEmployeeId, setRecipientEmployeeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [entityType, entityId, recipientEmployeeId]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications({
        entityType: entityType || undefined,
        entityId: entityId ? Number(entityId) : undefined,
        recipientEmployeeId: recipientEmployeeId ? Number(recipientEmployeeId) : undefined,
      });
      setNotifications(data);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-600 mt-1">Notification log for visitors, enquiries, appointments, and complaints</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as NotificationEntityType | '')}
              options={ENTITY_TYPE_OPTIONS}
            />
            <Input
              type="number"
              min="1"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="Filter by Entity ID"
            />
            <Input
              type="number"
              min="1"
              value={recipientEmployeeId}
              onChange={(e) => setRecipientEmployeeId(e.target.value)}
              placeholder="Filter by Recipient Employee ID"
            />
          </div>

          {error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : (
            <NotificationTable notifications={notifications} />
          )}
        </div>
      </Card>
    </div>
  );
}
