import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { CheckOutFormData } from '../../types/visitorLog.types';
import type { VisitorLogSummary } from '../../types/visitorLog.types';

interface CheckOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: VisitorLogSummary | null;
  onSubmit: (data: CheckOutFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CheckOutModal({ isOpen, onClose, log, onSubmit, isLoading }: CheckOutModalProps) {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRemarks('');
      setError(null);
    }
  }, [isOpen, log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ remarks: remarks || undefined });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to check out visitor'));
    }
  };

  if (!log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Check Out Visitor" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 space-y-1">
          <p><span className="font-medium text-slate-900">Visitor:</span> {log.visitor?.full_name ?? `#${log.visitor_id}`}</p>
          <p><span className="font-medium text-slate-900">Badge:</span> {log.badge_number}</p>
          <p><span className="font-medium text-slate-900">Checked in:</span> {new Date(log.check_in_time).toLocaleString()}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g., Meeting completed on time"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Checking Out...' : 'Check Out'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
