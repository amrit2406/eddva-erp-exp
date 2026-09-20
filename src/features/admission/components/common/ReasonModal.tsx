import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';

interface ReasonModalProps {
  title: string;
  description: React.ReactNode;
  placeholder?: string;
  submitLabel: string;
  submittingLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}

// Asks for a required reason before a destructive action (reject, decline,
// cancel). Mount only while open, so the reason starts empty each time.
export default function ReasonModal({
  title,
  description,
  placeholder,
  submitLabel,
  submittingLabel,
  submitting,
  error,
  onSubmit,
  onClose,
}: ReasonModalProps) {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(reason);
  };

  return (
    <Modal isOpen onClose={submitting ? () => {} : onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}
        <p className="text-sm text-slate-600">{description}</p>
        <div>
          <label htmlFor="reason_modal_text" className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
          <textarea
            id="reason_modal_text"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            required
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="danger" disabled={submitting || !reason.trim()}>
            {submitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
