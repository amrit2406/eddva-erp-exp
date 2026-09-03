import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportAlertFormData } from '../../types/tracking.types';

interface RaiseAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransportAlertFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function RaiseAlertModal({ isOpen, onClose, onSubmit, isLoading }: RaiseAlertModalProps) {
  const [formData, setFormData] = useState<TransportAlertFormData>({ alert_type: 'sos' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ alert_type: 'sos' });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to raise alert'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Raise Alert" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Alert Type *</label>
          <Select
            value={formData.alert_type}
            onChange={(e) => setFormData({ alert_type: e.target.value })}
            options={[
              { value: 'sos', label: 'SOS' },
              { value: 'speeding', label: 'Speeding' },
              { value: 'geofence', label: 'Geofence Breach' },
              { value: 'breakdown', label: 'Breakdown' },
              { value: 'other', label: 'Other' },
            ]}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Raising...' : 'Raise Alert'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
