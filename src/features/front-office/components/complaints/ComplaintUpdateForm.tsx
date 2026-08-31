import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { cn } from '../../../../utils/cn';
import type { CreateComplaintUpdateFormData } from '../../types/complaintRecord.types';

interface ComplaintUpdateFormProps {
  onSubmit: (data: CreateComplaintUpdateFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function ComplaintUpdateForm({ onSubmit, onCancel, isSubmitting = false, className }: ComplaintUpdateFormProps) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ notes });
      setNotes('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add update'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Update Notes <span className="text-red-500">*</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Plumber dispatched, expected fix by EOD"
          rows={3}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Update'}
        </Button>
      </div>
    </form>
  );
}
