import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ItemCategoryTable from '../../components/item-categories/ItemCategoryTable';
import { getItemCategories } from '../../api/sales-purchase.api';
import type { ItemCategory } from '../../types/sales-purchase.types';

export default function ItemCategoriesPage() {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getItemCategories();
      setCategories(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Let the axios interceptor handle 401
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Item Categories</h1>
          <p className="text-slate-600 mt-1">Manage item categories for inventory</p>
        </div>
        <Link to="/sales-purchase/item-categories/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <ItemCategoryTable categories={categories} />
          )}
        </div>
      </Card>
    </div>
  );
}
