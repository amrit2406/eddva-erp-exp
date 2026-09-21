import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';

interface BedNumberModalProps {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  initialValue?: string;
  onClose: () => void;
  // Should throw when the request fails so the modal can show the error.
  onSubmit: (bedNumber: string) => Promise<void>;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

function BedNumberForm({
  submitLabel,
  initialValue = '',
  onClose,
  onSubmit,
}: Omit<BedNumberModalProps, 'isOpen' | 'title'>) {
  const [bedNumber, setBedNumber] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(bedNumber.trim());
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to save bed'));
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
        <label htmlFor="bed_number" className="block text-sm font-medium text-slate-700 mb-1">
          Bed Number *
        </label>
        <input
          id="bed_number"
          type="text"
          value={bedNumber}
          onChange={(e) => setBedNumber(e.target.value)}
          placeholder="e.g. B1"
          className={inputClass}
          required
          autoFocus
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting || !bedNumber.trim()}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default function BedNumberModal({ isOpen, title, onClose, ...formProps }: BedNumberModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <BedNumberForm onClose={onClose} {...formProps} />
    </Modal>
  );
}
