import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { changeApplicationStatus } from '../../api/admission.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatLabel } from '../../utils/format';
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from '../../types/admission.types';

interface ApplicationStatusPanelProps {
  application: Application;
  canUpdate: boolean;
  onChanged: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

// Mount with a key that changes with the status, so the inputs reset after a save.
export default function ApplicationStatusPanel({ application, canUpdate, onChanged }: ApplicationStatusPanelProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await changeApplicationStatus(application.application_id, status, reason);
      toast.success('Application status updated');
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to update status'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Change Status</h2>

        <div>
          <label htmlFor="application-status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            id="application-status"
            value={status}
            disabled={!canUpdate}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
            className={`${inputClass} capitalize`}
          >
            {APPLICATION_STATUSES.map((option) => (
              <option key={option} value={option}>{formatLabel(option)}</option>
            ))}
          </select>
        </div>

        {canUpdate && (
          <>
            <div>
              <label htmlFor="application-reason" className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
              <textarea
                id="application-reason"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional — recorded in the status history"
                className={inputClass}
              />
            </div>
            <Button variant="primary" disabled={status === application.status || saving} onClick={handleSave}>
              {saving ? 'Saving...' : 'Update Status'}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
