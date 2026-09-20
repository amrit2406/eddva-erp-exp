import { useState } from 'react';
import { Link2, XCircle } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import ReasonModal from '../common/ReasonModal';
import { cancelConfirmation, linkStudent } from '../../api/admission.api';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { confirmationApplicantName, isConfirmed } from '../../utils/confirmations';
import type { Confirmation } from '../../types/admission.types';

interface ConfirmationActionsProps {
  confirmation: Confirmation;
  canUpdate: boolean;
  onChanged: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

// Link a student record and cancel — both only while the confirmation stands.
export default function ConfirmationActions({ confirmation, canUpdate, onChanged }: ConfirmationActionsProps) {
  const { toast } = useToast();
  const [studentRef, setStudentRef] = useState('');
  const [linking, setLinking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canUpdate || !isConfirmed(confirmation)) return null;

  const name = confirmationApplicantName(confirmation);
  const trimmedRef = studentRef.trim();

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLinking(true);
      await linkStudent(confirmation.confirmation_id, trimmedRef);
      toast.success('Student record linked');
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to link student record'));
    } finally {
      setLinking(false);
    }
  };

  const handleCancel = async (reason: string) => {
    try {
      setSubmitting(true);
      setError(null);
      await cancelConfirmation(confirmation.application_id, reason);
      toast.success('Confirmation cancelled');
      setCancelling(false);
      onChanged();
    } catch (err: any) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to cancel confirmation'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {!confirmation.student_ref && (
          <form onSubmit={handleLink}>
            <label htmlFor={`student_ref_${confirmation.confirmation_id}`} className="block text-sm font-medium text-slate-700 mb-1">
              Link Student Record
            </label>
            <div className="flex gap-2">
              <input
                id={`student_ref_${confirmation.confirmation_id}`}
                type="text"
                value={studentRef}
                onChange={(e) => setStudentRef(e.target.value)}
                placeholder="e.g. STU-2027-0042"
                className={inputClass}
              />
              <Button type="submit" variant="secondary" disabled={!trimmedRef || linking}>
                <Link2 className="h-4 w-4 mr-2" />
                {linking ? 'Linking...' : 'Link'}
              </Button>
            </div>
          </form>
        )}

        <Button
          variant="secondary"
          onClick={() => {
            setError(null);
            setCancelling(true);
          }}
        >
          <XCircle className="h-4 w-4 mr-2 text-red-600" />
          Cancel Confirmation
        </Button>
      </div>

      {cancelling && (
        <ReasonModal
          title="Cancel Confirmation"
          description={
            <>
              Cancel the confirmed admission of <span className="font-medium text-slate-900">{name}</span>?
            </>
          }
          placeholder="e.g. Family withdrew before joining"
          submitLabel="Cancel Confirmation"
          submittingLabel="Cancelling..."
          submitting={submitting}
          error={error}
          onSubmit={handleCancel}
          onClose={() => setCancelling(false)}
        />
      )}
    </>
  );
}
