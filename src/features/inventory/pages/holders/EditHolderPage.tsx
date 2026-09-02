import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { getHolder, updateHolder } from '../../api/holders.api';
import { getApiErrorMessage } from '../../utils/errors';
import { HOLDER_STATUS_OPTIONS } from '../../constants/holder.constants';
import type { InventoryHolderStatus, InventoryHolderType, InventoryHolderUpdateData } from '../../types/holder.types';

export default function EditHolderPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [holderType, setHolderType] = useState<InventoryHolderType>('staff');
  const [formData, setFormData] = useState<InventoryHolderUpdateData>({
    name: '',
    external_ref_id: '',
    contact_phone: '',
    status: 'ACTIVE',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadData() {
    if (!id) return;
    try {
      setLoading(true);
      const holder = await getHolder(id);
      setHolderType(holder.holder_type);
      setFormData({
        name: holder.name,
        external_ref_id: holder.external_ref_id ?? '',
        contact_phone: holder.contact_phone ?? '',
        status: holder.status,
      });
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load holder'));
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
      await updateHolder(id, formData);
      navigate('/inventory/holders');
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to update holder'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Holder</h1>
          <p className="text-slate-600 mt-1">Update holder details</p>
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
        <h1 className="text-2xl font-bold text-slate-900">Edit Holder</h1>
        <p className="text-slate-600 mt-1">Update holder details</p>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Holder Type</label>
                <input
                  type="text"
                  value={holderType}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 capitalize"
                />
                <p className="text-xs text-slate-500 mt-1">Holder type cannot be changed after creation.</p>
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InventoryHolderStatus })}
                options={HOLDER_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
              />
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
                {submitting ? 'Updating...' : 'Update Holder'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
