import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { createParticipant } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { SportsParticipantFormData } from '../../types/sports.types';

export default function CreateParticipantPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SportsParticipantFormData>({
    external_ref_id: '',
    name: '',
    class_section: '',
    photo_url: '',
    roll_number: '',
    gender: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createParticipant(formData);
      navigate('/sports/participants');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create participant'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Participant</h1>
        <p className="text-slate-600 mt-1">Register a new student sports participant</p>
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
                <label htmlFor="external_ref_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  id="external_ref_id"
                  value={formData.external_ref_id}
                  onChange={(e) => setFormData({ ...formData, external_ref_id: e.target.value })}
                  placeholder="e.g., STD-2026-089"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., David Miller"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="class_section" className="block text-sm font-medium text-slate-700 mb-1">
                  Class / Section
                </label>
                <input
                  type="text"
                  id="class_section"
                  value={formData.class_section}
                  onChange={(e) => setFormData({ ...formData, class_section: e.target.value })}
                  placeholder="e.g., Class X-B"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="roll_number" className="block text-sm font-medium text-slate-700 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  id="roll_number"
                  value={formData.roll_number}
                  onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                  placeholder="e.g., 24"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
                  Gender
                </label>
                <input
                  type="text"
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  placeholder="e.g., male"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="photo_url" className="block text-sm font-medium text-slate-700 mb-1">
                  Photo URL
                </label>
                <input
                  type="text"
                  id="photo_url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/sports/participants')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Participant'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
