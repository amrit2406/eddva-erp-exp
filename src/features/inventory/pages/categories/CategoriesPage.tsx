import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import CategoryTable from '../../components/categories/CategoryTable';
import { getCategories } from '../../api/categories.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryCategory } from '../../types/category.types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(loadCategories, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getCategories(search || undefined);
      setCategories(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load categories'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-600 mt-1">Manage inventory item categories</p>
        </div>
        <Link to="/inventory/categories/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name..."
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <CategoryTable categories={categories} />
        )}
      </Card>
    </div>
  );
}
