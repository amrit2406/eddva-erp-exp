import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { getCategory, updateCategory, getCategories } from '../../api/categories.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryCategory, InventoryCategoryUpdateData, InventoryCategoryStatus } from '../../types/category.types';

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function EditCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [formData, setFormData] = useState<InventoryCategoryUpdateData>({ name: '', status: 'ACTIVE' });
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
      const [category, allCategories] = await Promise.all([getCategory(id), getCategories()]);
      setFormData({
        name: category.name,
        parent_category_id: category.parent_category_id ?? undefined,
        status: category.status,
      });
      setCategories(allCategories.filter((c) => c.category_id !== category.category_id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load category'));
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
      await updateCategory(id, formData);
      navigate('/inventory/categories');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to update category'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Category</h1>
          <p className="text-slate-600 mt-1">Update category details</p>
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
        <h1 className="text-2xl font-bold text-slate-900">Edit Category</h1>
        <p className="text-slate-600 mt-1">Update category details</p>
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
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={120}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="parent_category_id" className="block text-sm font-medium text-slate-700 mb-1">
                Parent Category
              </label>
              <Select
                id="parent_category_id"
                value={formData.parent_category_id ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, parent_category_id: e.target.value ? Number(e.target.value) : undefined })
                }
                placeholder="None — top-level category"
                options={categories.map((c) => ({ value: String(c.category_id), label: c.name }))}
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as InventoryCategoryStatus })}
                options={STATUS_OPTIONS}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/inventory/categories')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Category'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
