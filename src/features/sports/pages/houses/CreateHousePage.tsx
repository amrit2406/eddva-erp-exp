import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { createHouse, getStaffList } from '../../api/sports.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { HouseFormData, SportsStaff } from '../../types/sports.types';

export default function CreateHousePage() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<SportsStaff[]>([]);
  const [formData, setFormData] = useState<HouseFormData>({
    name: '',
    color_code: '#3B82F6',
    house_master_id: undefined,
    motto: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStaffList().then(setStaff).catch(() => setStaff([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createHouse(formData);
      navigate('/sports/houses');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create house'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add House</h1>
        <p className="text-slate-600 mt-1">Create a new house</p>
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
                  placeholder="e.g., Falcon House"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="color_code" className="block text-sm font-medium text-slate-700 mb-1">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color_code"
                    value={formData.color_code || '#3B82F6'}
                    onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                    className="h-10 w-14 border border-slate-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color_code}
                    onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                    placeholder="#FF2233"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="house_master_id" className="block text-sm font-medium text-slate-700 mb-1">
                  House Master
                </label>
                <select
                  id="house_master_id"
                  value={formData.house_master_id ?? ''}
                  onChange={(e) => setFormData({ ...formData, house_master_id: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                >
                  <option value="">Unassigned</option>
                  {staff.map((member) => (
                    <option key={member.staff_id} value={member.staff_id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="motto" className="block text-sm font-medium text-slate-700 mb-1">
                  Motto
                </label>
                <input
                  type="text"
                  id="motto"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  placeholder="e.g., Fly High, Soar Together"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/sports/houses')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create House'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
