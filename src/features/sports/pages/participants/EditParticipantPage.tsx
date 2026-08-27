import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getParticipant, updateParticipant } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { SportsParticipantFormData } from '../../types/sports.types';

export default function EditParticipantPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<SportsParticipantFormData>({
    external_ref_id: '',
    name: '',
    class_section: '',
    photo_url: '',
    roll_number: '',
    gender: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getParticipant(id);
      setFormData({
        external_ref_id: data.external_ref_id ?? '',
        name: data.name,
        class_section: data.class_section ?? '',
        photo_url: data.photo_url ?? '',
        roll_number: data.roll_number ?? '',
        gender: data.gender ?? '',
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load participant'));
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateParticipant(id, formData);
      navigate('/sports/participants');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update participant'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Participant</h1>
          <p className="text-slate-600 mt-1">Update participant details</p>
        </div>
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Participant</h1>
        <p className="text-slate-600 mt-1">Update participant details</p>
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
                {submitting ? 'Updating...' : 'Update Participant'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
