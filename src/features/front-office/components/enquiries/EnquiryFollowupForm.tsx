import { useState } from 'react';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import { cn } from '../../../../utils/cn';
import type { CreateFollowupFormData } from '../../types/enquiryRecord.types';

interface EnquiryFollowupFormProps {
  onSubmit: (data: CreateFollowupFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function EnquiryFollowupForm({ onSubmit, onCancel, isSubmitting = false, className }: EnquiryFollowupFormProps) {
  const [notes, setNotes] = useState('');
  const [followupDate, setFollowupDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nextFollowupDate && followupDate && nextFollowupDate < followupDate) {
      setError('Next follow-up date cannot be before the follow-up date.');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        notes,
        followup_date: followupDate || undefined,
        next_followup_date: nextFollowupDate || undefined,
      });
      setNotes('');
      setNextFollowupDate('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add follow-up'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up Date</label>
          <Input type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Next Follow-up Date</label>
          <Input type="date" value={nextFollowupDate} onChange={(e) => setNextFollowupDate(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Notes <span className="text-red-500">*</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Called the enquirer, awaiting document submission"
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
          {isSubmitting ? 'Adding...' : 'Add Follow-up'}
        </Button>
      </div>
    </form>
  );
}
