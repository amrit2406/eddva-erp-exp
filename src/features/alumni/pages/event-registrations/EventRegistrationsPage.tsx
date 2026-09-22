import { useCallback } from 'react';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getEventRegistrations } from '../../api/eventRegistrations.api';
import { recordId } from '../../utils/records';
import type { GenericRecord, ListParams } from '../../types/profile.types';

const rowHref = (row: GenericRecord) => {
  const id = recordId(row, 'registration_id');
  return id ? `/alumni/event-registrations/${id}` : undefined;
};

export default function EventRegistrationsPage() {
  const load = useCallback((params: ListParams) => getEventRegistrations(params), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Event Registrations</h1>
        <p className="text-slate-600 mt-1">Registrations and payments across all alumni events</p>
      </div>

      <Card className="border-slate-200">
        <RecordPanel load={load} emptyMessage="No event registrations found" rowHref={rowHref} />
      </Card>
    </div>
  );
}
