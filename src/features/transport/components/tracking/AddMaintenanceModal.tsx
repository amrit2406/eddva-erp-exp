import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportMaintenanceFormData } from '../../types/tracking.types';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransportMaintenanceFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AddMaintenanceModal({ isOpen, onClose, onSubmit, isLoading }: AddMaintenanceModalProps) {
  const [formData, setFormData] = useState<TransportMaintenanceFormData>({
    service_date: '',
    service_type: '',
    cost: undefined,
    next_service_due_km: undefined,
    next_service_due_date: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        service_date: '',
        service_type: '',
        cost: undefined,
        next_service_due_km: undefined,
        next_service_due_date: '',
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_date || !formData.service_type.trim()) {
      setError('Service date and service type are required.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add maintenance record'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Maintenance Record" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Date *</label>
            <input
              type="date"
              value={formData.service_date}
              onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Type *</label>
            <input
              type="text"
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              placeholder="e.g., oil_change"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={formData.cost ?? ''}
            onChange={(e) =>
              setFormData({ ...formData, cost: e.target.value ? Number(e.target.value) : undefined })
            }
            placeholder="e.g., 1500"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Next Service Due (km)</label>
            <input
              type="number"
              min={0}
              value={formData.next_service_due_km ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  next_service_due_km: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="e.g., 50000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Next Service Due Date</label>
            <input
              type="date"
              value={formData.next_service_due_date}
              onChange={(e) => setFormData({ ...formData, next_service_due_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
