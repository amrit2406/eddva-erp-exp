import { useEffect, useState } from 'react';
import Button from '../../../../components/ui/Button';
import ObjectTable from '../common/ObjectTable';
import { getEventAttendees, recordAttendance } from '../../api/events.api';
import { useToast } from '../../../../hooks/useToast';
import { flattenRecord, humanizeKey } from '../../utils/format';
import { getApiErrorMessage } from '../../utils/errors';
import { recordId, recordStatus } from '../../utils/records';
import type { GenericRecord } from '../../types/profile.types';

interface EventAttendeesPanelProps {
  eventId: string;
  canManage: boolean;
}

const STATUS_OPTIONS = ['registered', 'attended', 'no_show', 'cancelled'];

const inputClass =
  'px-2 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function EventAttendeesPanel({ eventId, canManage }: EventAttendeesPanelProps) {
  const { toast } = useToast();
  const [attendees, setAttendees] = useState<GenericRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [changes, setChanges] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    getEventAttendees(eventId)
      .then((result) => {
        setAttendees(Array.isArray(result.data) ? result.data : []);
        setChanges({});
        setError(null);
      })
      .catch((err) => {
        if (err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load attendees'));
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleSave = async () => {
    const records = Object.entries(changes).map(([registrationId, status]) => ({
      registration_id: Number(registrationId),
      status,
    }));
    if (records.length === 0) return;
    try {
      setSaving(true);
      await recordAttendance(eventId, records);
      toast.success('Attendance saved');
      load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save attendance'));
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!attendees) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (attendees.length === 0) return <div className="p-8 text-center text-slate-500">No registrations yet</div>;

  if (!canManage) return <ObjectTable rows={attendees} emptyMessage="No registrations yet" />;

  // Columns picked the same way ObjectTable does, minus a Status column we render ourselves.
  const flatRows = attendees.map(flattenRecord);
  const columns = Object.keys(flatRows[0] ?? {}).filter(
    (key) => !/(^id$|_id$|status)/.test(key) && typeof flatRows[0][key] !== 'object'
  ).slice(0, 4);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((column) => (
                <th key={column} className="text-left py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                  {humanizeKey(column)}
                </th>
              ))}
              <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((attendee, index) => {
              const registrationId = recordId(attendee, 'registration_id');
              const currentStatus = changes[Number(registrationId)] ?? recordStatus(attendee) ?? '';
              return (
                <tr key={registrationId ?? index} className="border-b border-slate-100 hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column} className="py-3 px-4 text-slate-600">
                      {String(flatRows[index][column] ?? '—')}
                    </td>
                  ))}
                  <td className="py-3 px-4">
                    {registrationId ? (
                      <select
                        value={currentStatus}
                        onChange={(e) =>
                          setChanges((prev) => ({ ...prev, [Number(registrationId)]: e.target.value }))
                        }
                        className={inputClass}
                      >
                        <option value="">—</option>
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    ) : (
                      currentStatus || '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-slate-200 flex justify-end">
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || Object.keys(changes).length === 0}>
          {saving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>
    </div>
  );
}
