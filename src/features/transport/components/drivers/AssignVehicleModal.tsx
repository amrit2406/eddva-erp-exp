import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportAssignVehicleToDriverFormData } from '../../types/driver.types';
import type { TransportVehicle } from '../../types/vehicle.types';

interface AssignVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: TransportVehicle[];
  onSubmit: (data: TransportAssignVehicleToDriverFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AssignVehicleModal({ isOpen, onClose, vehicles, onSubmit, isLoading }: AssignVehicleModalProps) {
  const [formData, setFormData] = useState<TransportAssignVehicleToDriverFormData>({
    vehicle_id: 0,
    assigned_from: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ vehicle_id: 0, assigned_from: '' });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle_id || !formData.assigned_from) {
      setError('Please select a vehicle and assigned-from date.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to assign vehicle'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Vehicle" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle *</label>
          <Select
            value={formData.vehicle_id || ''}
            onChange={(e) => setFormData({ ...formData, vehicle_id: Number(e.target.value) })}
            placeholder="Select a vehicle"
            options={vehicles.map((v) => ({
              value: String(v.vehicle_id),
              label: `${v.registration_number} — ${v.model}`,
            }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Assigned From *</label>
          <input
            type="date"
            value={formData.assigned_from}
            onChange={(e) => setFormData({ ...formData, assigned_from: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Assigning...' : 'Assign Vehicle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
