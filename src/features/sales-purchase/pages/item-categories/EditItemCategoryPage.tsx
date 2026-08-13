import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ItemCategoryForm from '../../components/item-categories/ItemCategoryForm';
import { getItemCategory, updateItemCategory } from '../../api/sales-purchase.api';
import type { ItemCategoryFormData } from '../../types/sales-purchase.types';

export default function EditItemCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState<ItemCategoryFormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  async function loadData(categoryId: string) {
    try {
      setLoading(true);
      const data = await getItemCategory(categoryId);
      setDefaultValues({
        categoryName: data.categoryName,
      });
    } catch (error: any) {
      console.error('Failed to load data:', error);
      if (error.response?.status === 401) {
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (data: ItemCategoryFormData) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateItemCategory(id, data);
      navigate('/sales-purchase/item-categories');
    } catch (error: any) {
      console.error('Failed to update item category:', error);
      if (error.response?.status === 401) {
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to update item category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/item-categories">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Item Category</h1>
          <p className="text-slate-600 mt-1">Update category information</p>
        </div>
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="p-6">
            {defaultValues && (
              <ItemCategoryForm
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitText="Update Category"
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
