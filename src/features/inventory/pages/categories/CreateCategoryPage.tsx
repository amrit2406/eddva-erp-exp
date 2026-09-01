import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createCategory, getCategories } from '../../api/categories.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryCategory, InventoryCategoryFormData } from '../../types/category.types';

export default function CreateCategoryPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [formData, setFormData] = useState<InventoryCategoryFormData>({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createCategory(formData);
      navigate('/inventory/categories');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create category'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Category</h1>
        <p className="text-slate-600 mt-1">Create a new inventory item category</p>
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
                placeholder="e.g., Electronics"
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
                {submitting ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
