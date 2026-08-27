import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createVenue } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { VenueFormData } from '../../types/sports.types';

const TYPE_OPTIONS = [
  { value: 'ground', label: 'Ground' },
  { value: 'court', label: 'Court' },
  { value: 'pool', label: 'Pool' },
  { value: 'hall', label: 'Hall' },
];

export default function CreateVenuePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    type: 'ground',
    capacity: undefined,
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createVenue(formData);
      navigate('/sports/venues');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create venue'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Venue</h1>
        <p className="text-slate-600 mt-1">Register a new sports venue</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Football Ground"
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
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as VenueFormData['type'] })}
                  options={TYPE_OPTIONS}
                  required
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-slate-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  min="0"
                  value={formData.capacity ?? ''}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g., 1000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., North Campus Sports Complex"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/sports/venues')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Venue'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
