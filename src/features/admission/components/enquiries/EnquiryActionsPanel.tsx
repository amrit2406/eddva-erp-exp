import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightCircle } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { assignEnquiry, changeEnquiryStatus } from '../../api/admission.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatLabel } from '../../utils/format';
import { ENQUIRY_MANUAL_STATUSES, type Enquiry, type EnquiryStatus } from '../../types/admission.types';

interface EnquiryActionsPanelProps {
  enquiry: Enquiry;
  canUpdate: boolean;
  onChanged: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

// Mount with a key that changes when the enquiry does, so the local inputs
// reset to the freshly saved values.
export default function EnquiryActionsPanel({ enquiry, canUpdate, onChanged }: EnquiryActionsPanelProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [assignee, setAssignee] = useState(enquiry.assigned_to ?? '');
  const [busy, setBusy] = useState<'status' | 'assign' | null>(null);

  const isConverted = enquiry.status === 'converted';
  const statusOptions = ENQUIRY_MANUAL_STATUSES.includes(enquiry.status)
    ? ENQUIRY_MANUAL_STATUSES
    : [enquiry.status, ...ENQUIRY_MANUAL_STATUSES];

  const run = async (kind: 'status' | 'assign', action: () => Promise<unknown>, success: string, failure: string) => {
    try {
      setBusy(kind);
      await action();
      toast.success(success);
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, failure));
    } finally {
      setBusy(null);
    }
  };

  const trimmedAssignee = assignee.trim();

  return (
    <Card className="border-slate-200">
      <div className="p-6 space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Actions</h2>

        <div>
          <label htmlFor="enquiry-status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <div className="flex gap-2">
            <select
              id="enquiry-status"
              value={status}
              disabled={!canUpdate || isConverted}
              onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
              className={`${inputClass} capitalize`}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>{formatLabel(option)}</option>
              ))}
            </select>
            {canUpdate && !isConverted && (
              <Button
                variant="secondary"
                disabled={status === enquiry.status || busy !== null}
                onClick={() =>
                  run('status', () => changeEnquiryStatus(enquiry.enquiry_id, status), 'Status updated', 'Failed to update status')
                }
              >
                {busy === 'status' ? 'Saving...' : 'Update'}
              </Button>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="enquiry-assignee" className="block text-sm font-medium text-slate-700 mb-1">Assigned To</label>
          <div className="flex gap-2">
            <input
              id="enquiry-assignee"
              type="text"
              value={assignee}
              disabled={!canUpdate}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Admission user ID"
              className={inputClass}
            />
            {canUpdate && (
              <Button
                variant="secondary"
                disabled={!trimmedAssignee || trimmedAssignee === (enquiry.assigned_to ?? '') || busy !== null}
                onClick={() =>
                  run('assign', () => assignEnquiry(enquiry.enquiry_id, trimmedAssignee), 'Enquiry assigned', 'Failed to assign enquiry')
                }
              >
                {busy === 'assign' ? 'Saving...' : 'Assign'}
              </Button>
            )}
          </div>
        </div>

        {canUpdate && !isConverted && (
          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600 mb-3">
              Ready to admit? Convert this enquiry into an application for an academic session.
            </p>
            <Link to={`/admission/enquiries/${enquiry.enquiry_id}/convert`}>
              <Button variant="primary">
                <ArrowRightCircle className="h-4 w-4 mr-2" />
                Convert to Application
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
