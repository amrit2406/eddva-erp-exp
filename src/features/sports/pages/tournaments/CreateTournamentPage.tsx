import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createTournament, getSports, getVenues } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { TournamentFormData, Sport, Venue } from '../../types/sports.types';

const LEVEL_OPTIONS = [
  { value: 'inter_house', label: 'Inter-House' },
  { value: 'inter_school', label: 'Inter-School' },
  { value: 'inter_district', label: 'Inter-District' },
];

const FORMAT_OPTIONS = [
  { value: 'knockout', label: 'Knockout' },
  { value: 'league', label: 'League' },
  { value: 'round_robin', label: 'Round Robin' },
];

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function CreateTournamentPage() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    sport_id: 0,
    level: 'inter_house',
    format: 'knockout',
    start_date: '',
    end_date: '',
    venue_id: undefined,
    status: 'upcoming',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSports().then(setSports).catch(() => setSports([]));
    getVenues().then(setVenues).catch(() => setVenues([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sport_id) {
      setError('Select a sport.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await createTournament(formData);
      navigate('/sports/tournaments');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create tournament'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Tournament</h1>
        <p className="text-slate-600 mt-1">Create a new tournament</p>
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
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Inter-House Football Championship 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="sport_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Sport *
                </label>
                <select
                  id="sport_id"
                  value={formData.sport_id || ''}
                  onChange={(e) => setFormData({ ...formData, sport_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                >
                  <option value="">Select a sport</option>
                  {sports.map((s) => (
                    <option key={s.sport_id} value={s.sport_id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="venue_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Primary Venue
                </label>
                <select
                  id="venue_id"
                  value={formData.venue_id ?? ''}
                  onChange={(e) => setFormData({ ...formData, venue_id: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                >
                  <option value="">No venue</option>
                  {venues.map((v) => (
                    <option key={v.venue_id} value={v.venue_id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-slate-700 mb-1">
                  Level
                </label>
                <Select
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as TournamentFormData['level'] })}
                  options={LEVEL_OPTIONS}
                />
              </div>

              <div>
                <label htmlFor="format" className="block text-sm font-medium text-slate-700 mb-1">
                  Format
                </label>
                <Select
                  id="format"
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value as TournamentFormData['format'] })}
                  options={FORMAT_OPTIONS}
                />
              </div>

              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="start_date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-slate-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="end_date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <Select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TournamentFormData['status'] })}
                  options={STATUS_OPTIONS}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/sports/tournaments')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Tournament'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
