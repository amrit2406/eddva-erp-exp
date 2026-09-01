import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createLocation } from '../../api/locations.api';
import { getApiErrorMessage } from '../../utils/errors';
import { LOCATION_TYPE_OPTIONS } from '../../constants/location.constants';
import type { InventoryLocationFormData, InventoryLocationType } from '../../types/location.types';

export default function CreateLocationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InventoryLocationFormData>({ name: '', type: 'store' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createLocation(formData);
      navigate('/inventory/locations');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create location'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Location</h1>
        <p className="text-slate-600 mt-1">Create a new inventory location</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Location Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Store"
                maxLength={120}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">
                Type *
              </label>
              <Select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as InventoryLocationType })}
                options={LOCATION_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/inventory/locations')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Location'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
