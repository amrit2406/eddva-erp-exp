import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { changeInterviewStatus } from '../../api/admission.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatLabel } from '../../utils/format';
import { INTERVIEW_STATUSES, type Interview, type InterviewStatus } from '../../types/admission.types';

interface InterviewStatusPanelProps {
  interview: Interview;
  canUpdate: boolean;
  onChanged: () => void;
}

// Mount with a key that changes with the status, so the select resets after a save.
export default function InterviewStatusPanel({ interview, canUpdate, onChanged }: InterviewStatusPanelProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<InterviewStatus>(interview.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await changeInterviewStatus(interview.interview_id, status);
      toast.success('Interview status updated');
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to update status'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Status</h2>
        <div className="flex gap-2">
          <select
            value={status}
            disabled={!canUpdate}
            onChange={(e) => setStatus(e.target.value as InterviewStatus)}
            aria-label="Interview status"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          >
            {INTERVIEW_STATUSES.map((option) => (
              <option key={option} value={option}>{formatLabel(option)}</option>
            ))}
          </select>
          {canUpdate && (
            <Button variant="secondary" disabled={status === interview.status || saving} onClick={handleSave}>
              {saving ? 'Saving...' : 'Update'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
