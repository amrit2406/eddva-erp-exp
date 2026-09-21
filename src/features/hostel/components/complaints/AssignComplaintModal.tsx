import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import WardenSelect from '../blocks/WardenSelect';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { getCachedIsHostelInstituteAdmin } from '../../utils/ssoSession';

interface AssignComplaintModalProps {
  currentAssignee?: string;
  onClose: () => void;
  // Should throw when the request fails so the modal can show the error.
  onSubmit: (assignedTo: string, notes: string) => Promise<void>;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

function AssignForm({ currentAssignee, onClose, onSubmit }: AssignComplaintModalProps) {
  const [assignee, setAssignee] = useState(currentAssignee ?? '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listing hostel users is an Institute Admin capability. For anyone else the
  // lookup would only raise an access-denied toast, so they type the user id.
  const canPickUser = getCachedIsHostelInstituteAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(assignee, notes);
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to assign complaint'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label htmlFor="complaint_assignee" className="block text-sm font-medium text-slate-700 mb-1">
          Assign To *
        </label>
        {canPickUser ? (
          <WardenSelect
            id="complaint_assignee"
            value={assignee}
            onChange={setAssignee}
            required
            noun="person"
            fallbackPlaceholder="e.g. usr_maintenance_007"
          />
        ) : (
          <input
            id="complaint_assignee"
            type="text"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="e.g. usr_maintenance_007"
            className={inputClass}
            required
          />
        )}
        {!canPickUser && <p className="text-xs text-slate-500 mt-1">Enter the ERP user ID of the person to assign.</p>}
      </div>

      <div>
        <label htmlFor="complaint_assign_notes" className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          id="complaint_assign_notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Please check today"
          className={inputClass}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting || !assignee.trim()}>
          {submitting ? 'Assigning...' : 'Assign'}
        </Button>
      </div>
    </form>
  );
}

export default function AssignComplaintModal(props: AssignComplaintModalProps) {
  return (
    <Modal isOpen onClose={props.onClose} title="Assign Complaint">
      <AssignForm {...props} />
    </Modal>
  );
}
