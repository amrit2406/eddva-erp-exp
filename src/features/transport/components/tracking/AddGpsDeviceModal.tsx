import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportGpsDeviceFormData } from '../../types/tracking.types';

interface AddGpsDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransportGpsDeviceFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AddGpsDeviceModal({ isOpen, onClose, onSubmit, isLoading }: AddGpsDeviceModalProps) {
  const [formData, setFormData] = useState<TransportGpsDeviceFormData>({
    device_serial: '',
    sim_number: '',
    installed_date: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ device_serial: '', sim_number: '', installed_date: '' });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.device_serial.trim()) {
      setError('Device serial is required.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add GPS device'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add GPS Device" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Device Serial *</label>
          <input
            type="text"
            value={formData.device_serial}
            onChange={(e) => setFormData({ ...formData, device_serial: e.target.value })}
            placeholder="e.g., GPS-SN-00123"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SIM Number</label>
          <input
            type="text"
            value={formData.sim_number}
            onChange={(e) => setFormData({ ...formData, sim_number: e.target.value })}
            placeholder="e.g., 9876543210"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Installed Date</label>
          <input
            type="date"
            value={formData.installed_date}
            onChange={(e) => setFormData({ ...formData, installed_date: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Device'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
