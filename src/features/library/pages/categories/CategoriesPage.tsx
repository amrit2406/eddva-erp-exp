import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import CategoryTable from '../../components/categories/CategoryTable';
import { getCategories, deleteCategory } from '../../api/library.api';
import type { Category } from '../../types/library.types';
import { ROUTES } from '../../../../constants/routes';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.category_id !== id));
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err.response?.data?.message || (err instanceof Error ? err.message : 'Failed to delete category'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-600 mt-1">Manage library book categories</p>
        </div>
        <Link to={ROUTES.LIBRARY_CATEGORIES_NEW}>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <CategoryTable categories={categories} onDelete={handleDelete} />
        </Card>
      )}
    </div>
  );
}