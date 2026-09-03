import { useEffect, useState } from 'react';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import Select from '../../../../components/ui/Select';
import { getRouteStops } from '../../api/routes.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportAllocateRouteFormData } from '../../types/passenger.types';
import type { TransportRoute, TransportRouteStop } from '../../types/route.types';

interface AllocateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: TransportRoute[];
  onSubmit: (data: TransportAllocateRouteFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function AllocateRouteModal({ isOpen, onClose, routes, onSubmit, isLoading }: AllocateRouteModalProps) {
  const [formData, setFormData] = useState<TransportAllocateRouteFormData>({
    route_id: 0,
    effective_from: '',
    pickup_stop_id: undefined,
    drop_stop_id: undefined,
  });
  const [stops, setStops] = useState<TransportRouteStop[]>([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ route_id: 0, effective_from: '', pickup_stop_id: undefined, drop_stop_id: undefined });
      setStops([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!formData.route_id) {
      setStops([]);
      return;
    }
    let cancelled = false;
    setLoadingStops(true);
    getRouteStops(formData.route_id)
      .then((data) => {
        if (!cancelled) setStops(data);
      })
      .catch(() => {
        if (!cancelled) setStops([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingStops(false);
      });
    return () => {
      cancelled = true;
    };
  }, [formData.route_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.route_id || !formData.effective_from) {
      setError('Please select a route and effective date.');
      return;
    }
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to allocate route'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Allocate Route" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Route *</label>
          <Select
            value={formData.route_id || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                route_id: Number(e.target.value),
                pickup_stop_id: undefined,
                drop_stop_id: undefined,
              })
            }
            placeholder="Select a route"
            options={routes.map((r) => ({ value: String(r.route_id), label: r.name }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pickup Stop</label>
            <Select
              value={formData.pickup_stop_id ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, pickup_stop_id: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder={loadingStops ? 'Loading stops...' : 'Select a stop'}
              disabled={!formData.route_id || loadingStops}
              options={stops.map((s) => ({ value: String(s.stop_id), label: s.stop_name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Drop Stop</label>
            <Select
              value={formData.drop_stop_id ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, drop_stop_id: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder={loadingStops ? 'Loading stops...' : 'Select a stop'}
              disabled={!formData.route_id || loadingStops}
              options={stops.map((s) => ({ value: String(s.stop_id), label: s.stop_name }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Effective From *</label>
          <input
            type="date"
            value={formData.effective_from}
            onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Allocating...' : 'Allocate Route'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
