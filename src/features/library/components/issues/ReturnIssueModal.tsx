import { useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { useLibrarianStore } from '../../stores/librarian.store';
import { getApiErrorMessage } from '../../utils/apiError';
import type { BookIssue, BookIssueReturnData, ReturnIssueResult, ReturnedCondition } from '../../types/library.types';

interface ReturnIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: BookIssue | null;
  onSubmit: (id: number, data: BookIssueReturnData) => Promise<ReturnIssueResult | void>;
  isLoading?: boolean;
}

const CONDITION_OPTIONS: { value: ReturnedCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'worn', label: 'Worn' },
  { value: 'damaged', label: 'Damaged' },
];

export default function ReturnIssueModal({ isOpen, onClose, issue, onSubmit, isLoading }: ReturnIssueModalProps) {
  const { librarianId } = useLibrarianStore();
  const [condition, setCondition] = useState<ReturnedCondition>('good');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;
    setError(null);
    try {
      await onSubmit(issue.issue_id, {
        received_by: librarianId,
        returned_to: librarianId,
        returned_condition: condition,
      });
      setCondition('good');
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to return book'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return Book" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
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
              <span className="font-medium">Due Date:</span> {new Date(issue.due_date).toLocaleDateString()}
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Returned Condition</label>
          <Select
            required
            value={condition}
            onChange={(e) => setCondition(e.target.value as ReturnedCondition)}
            options={CONDITION_OPTIONS}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Returning...' : 'Return Book'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
