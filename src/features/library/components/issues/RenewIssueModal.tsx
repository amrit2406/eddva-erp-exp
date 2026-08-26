import { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { useLibrarianStore } from '../../stores/librarian.store';
import { getApiErrorMessage } from '../../utils/apiError';
import type { BookIssue, BookIssueRenewData } from '../../types/library.types';

interface RenewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: BookIssue | null;
  onSubmit: (id: number, data: BookIssueRenewData) => Promise<void>;
  isLoading?: boolean;
}

export default function RenewIssueModal({ isOpen, onClose, issue, onSubmit, isLoading }: RenewIssueModalProps) {
  const { librarianId } = useLibrarianStore();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!issue) return;
    setError(null);
    try {
      await onSubmit(issue.issue_id, { renewed_by: librarianId });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to renew issue'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renew Book Issue" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {issue && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="text-sm text-slate-600">
              <span className="font-medium">Book:</span> {issue.book_title}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              <span className="font-medium">Copy ID:</span> {issue.copy_id}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              <span className="font-medium">Current Due Date:</span> {new Date(issue.due_date).toLocaleDateString()}
            </div>
            {issue.renewal_count !== undefined && (
              <div className="text-sm text-slate-600 mt-1">
                <span className="font-medium">Renewal Count:</span> {issue.renewal_count}
              </div>
            )}
          </div>
        )}
        <p className="text-sm text-slate-500">Extend the due date for this loan?</p>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Renewing...' : 'Confirm Renewal'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
