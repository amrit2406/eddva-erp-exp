import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportRouteStopFormData } from '../../types/route.types';

interface AddStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransportRouteStopFormData) => Promise<void>;
  nextSequenceNo: number;
  isLoading?: boolean;
}

export default function AddStopModal({ isOpen, onClose, onSubmit, nextSequenceNo, isLoading }: AddStopModalProps) {
  const [formData, setFormData] = useState<TransportRouteStopFormData>({
    stop_name: '',
    sequence_no: nextSequenceNo,
    latitude: undefined,
    longitude: undefined,
    pickup_time: '',
    drop_time: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        stop_name: '',
        sequence_no: nextSequenceNo,
        latitude: undefined,
        longitude: undefined,
        pickup_time: '',
        drop_time: '',
      });
      setError(null);
    }
  }, [isOpen, nextSequenceNo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stop_name.trim()) {
      setError('Stop name is required.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to add stop'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Stop" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Stop Name *</label>
          <input
            type="text"
            value={formData.stop_name}
            onChange={(e) => setFormData({ ...formData, stop_name: e.target.value })}
            placeholder="e.g., Central Station"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sequence No. *</label>
          <input
            type="number"
            min={1}
            value={formData.sequence_no || ''}
            onChange={(e) => setFormData({ ...formData, sequence_no: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={formData.latitude ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, latitude: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="e.g., 28.7041"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={formData.longitude ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, longitude: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="e.g., 77.1025"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Time</label>
            <input
              type="time"
              value={formData.pickup_time}
              onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Drop Time</label>
            <input
              type="time"
              value={formData.drop_time}
              onChange={(e) => setFormData({ ...formData, drop_time: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Stop'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
