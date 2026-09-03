import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportSubscribeFormData } from '../../types/fee.types';
import type { TransportFeePlan } from '../../types/fee.types';

interface SubscribePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: TransportFeePlan[];
  onSubmit: (data: TransportSubscribeFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function SubscribePlanModal({ isOpen, onClose, plans, onSubmit, isLoading }: SubscribePlanModalProps) {
  const [formData, setFormData] = useState<TransportSubscribeFormData>({
    fee_plan_id: 0,
    start_date: '',
    status: 'active',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ fee_plan_id: 0, start_date: '', status: 'active' });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fee_plan_id || !formData.start_date) {
      setError('Please select a fee plan and start date.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to subscribe to plan'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subscribe to Fee Plan" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fee Plan *</label>
          <Select
            value={formData.fee_plan_id || ''}
            onChange={(e) => setFormData({ ...formData, fee_plan_id: Number(e.target.value) })}
            placeholder="Select a fee plan"
            options={plans.map((p) => ({
              value: String(p.fee_plan_id),
              label: `${p.name} — ₹${p.amount}/${p.billing_cycle}`,
            }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
          <Select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as TransportSubscribeFormData['status'] })
            }
            options={[
              { value: 'active', label: 'Active' },
              { value: 'ended', label: 'Ended' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
