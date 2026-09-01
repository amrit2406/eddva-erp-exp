import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import { createItem } from '../../api/items.api';
import { getCategories } from '../../api/categories.api';
import { getApiErrorMessage } from '../../utils/errors';
import { ITEM_TYPE_OPTIONS } from '../../constants/item.constants';
import type { InventoryItemFormData, InventoryItemType } from '../../types/item.types';
import type { InventoryCategory } from '../../types/category.types';

export default function CreateItemPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [formData, setFormData] = useState<InventoryItemFormData>({
    item_code: '',
    name: '',
    category_id: 0,
    item_type: 'consumable',
    unit_of_measure: '',
    reorder_level: 0,
    description: '',
    image_url: '',
  });
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
      await createItem(formData);
      navigate('/inventory/items');
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to create item'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Item</h1>
        <p className="text-slate-600 mt-1">Create a new inventory item master record</p>
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
                <label htmlFor="item_code" className="block text-sm font-medium text-slate-700 mb-1">
                  Item Code *
                </label>
                <input
                  type="text"
                  id="item_code"
                  value={formData.item_code}
                  onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                  placeholder="e.g., ITM-0001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., A4 Printer Paper (Ream)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <Select
                  id="category_id"
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                  placeholder="Select a category"
                  options={categories.map((c) => ({ value: String(c.category_id), label: c.name }))}
                  required
                />
              </div>

              <div>
                <label htmlFor="item_type" className="block text-sm font-medium text-slate-700 mb-1">
                  Item Type *
                </label>
                <Select
                  id="item_type"
                  value={formData.item_type}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value as InventoryItemType })}
                  options={ITEM_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="unit_of_measure" className="block text-sm font-medium text-slate-700 mb-1">
                  Unit of Measure *
                </label>
                <input
                  type="text"
                  id="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                  placeholder="e.g., ream"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="reorder_level" className="block text-sm font-medium text-slate-700 mb-1">
                  Reorder Level
                </label>
                <input
                  type="number"
                  id="reorder_level"
                  min={0}
                  value={formData.reorder_level ?? 0}
                  onChange={(e) => setFormData({ ...formData, reorder_level: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="e.g., 80 GSM, 500 sheets per ream"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-slate-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="e.g., https://cdn.example.com/items/a4-paper.jpg"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/inventory/items')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Item'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
