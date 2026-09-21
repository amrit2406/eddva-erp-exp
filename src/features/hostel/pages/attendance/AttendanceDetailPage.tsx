import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import GenericDataView from '../../components/common/GenericDataView';
import RecordStatusBadge from '../../components/common/RecordStatusBadge';
import ActionModal, { type ActionValues } from '../../components/residents/ActionModal';
import { getAttendanceRecord, updateAttendance } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { ATTENDANCE_STATUSES } from '../../utils/attendance';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { recordStatus, relatedId } from '../../utils/records';
import type { GenericRecord } from '../../types/hostel.types';

export default function AttendanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('attendance');
  const [record, setRecord] = useState<GenericRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getAttendanceRecord(id)
      .then((data) => {
        if (!cancelled) setRecord(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load attendance record'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleUpdate = async (values: ActionValues) => {
    if (!id) return;
    await updateAttendance(id, values.status, values.remarks);
    setRecord(await getAttendanceRecord(id));
    setEditing(false);
    toast.success('Attendance updated');
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!record) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const status = recordStatus(record);
  const residentId = relatedId(record, 'resident', 'resident_id');

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/attendance" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to attendance
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Attendance #{id}</h1>
              <RecordStatusBadge status={status} />
            </div>
            {residentId && (
              <Link to={`/hostel/residents/${residentId}`} className="inline-block mt-2 text-sm text-[#008BE9] hover:underline">
                View resident
              </Link>
            )}
          </div>
          {can('update') && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <Card className="border-slate-200">
        <GenericDataView data={record} emptyMessage="No details available" />
      </Card>

      {editing && (
        <ActionModal
          isOpen
          title="Edit Attendance"
          submitLabel="Save"
          fields={[
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [...ATTENDANCE_STATUSES],
              required: true,
              defaultValue: status ?? '',
            },
            {
              name: 'remarks',
              label: 'Remarks',
              type: 'textarea',
              placeholder: 'Optional note',
              defaultValue: typeof record.remarks === 'string' ? record.remarks : '',
            },
          ]}
          onClose={() => setEditing(false)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
