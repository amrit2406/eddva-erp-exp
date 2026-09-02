import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createHolder } from '../../api/holders.api';
import { getApiErrorMessage } from '../../utils/errors';
import { HOLDER_TYPE_OPTIONS } from '../../constants/holder.constants';
import type { InventoryHolderFormData, InventoryHolderType } from '../../types/holder.types';

export default function CreateHolderPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InventoryHolderFormData>({
    holder_type: 'staff',
    name: '',
    external_ref_id: '',
    contact_phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createHolder(formData);
      navigate('/inventory/holders');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to create holder'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Holder</h1>
        <p className="text-slate-600 mt-1">Register a staff, student, or department as an inventory holder</p>
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
                <label htmlFor="holder_type" className="block text-sm font-medium text-slate-700 mb-1">
                  Holder Type *
                </label>
                <Select
                  id="holder_type"
                  value={formData.holder_type}
                  onChange={(e) => setFormData({ ...formData, holder_type: e.target.value as InventoryHolderType })}
                  options={HOLDER_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Priya Sharma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="external_ref_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Reference ID
                </label>
                <input
                  type="text"
                  id="external_ref_id"
                  value={formData.external_ref_id}
                  onChange={(e) => setFormData({ ...formData, external_ref_id: e.target.value })}
                  placeholder="e.g., STF-00234"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">Optional link to the staff/student id in the parent system.</p>
              </div>

              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="e.g., 9876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/inventory/holders')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Holder'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
