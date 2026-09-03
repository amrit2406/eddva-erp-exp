import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { createRoute } from '../../api/routes.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { TransportRouteFormData } from '../../types/route.types';

export default function CreateRoutePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TransportRouteFormData>({
    name: '',
    start_location: '',
    end_location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createRoute(formData);
      navigate('/transport/routes');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create route'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Route</h1>
        <p className="text-slate-600 mt-1">Create a new transport route</p>
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
                Route Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Downtown Express"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_location" className="block text-sm font-medium text-slate-700 mb-1">
                  Start Location *
                </label>
                <input
                  type="text"
                  id="start_location"
                  value={formData.start_location}
                  onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                  placeholder="e.g., City Center"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="end_location" className="block text-sm font-medium text-slate-700 mb-1">
                  End Location *
                </label>
                <input
                  type="text"
                  id="end_location"
                  value={formData.end_location}
                  onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                  placeholder="e.g., Campus"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/transport/routes')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Route'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
