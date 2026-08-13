import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ItemCategoryForm from '../../components/item-categories/ItemCategoryForm';
import { createItemCategory } from '../../api/sales-purchase.api';
import type { ItemCategoryFormData } from '../../types/sales-purchase.types';

export default function CreateItemCategoryPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ItemCategoryFormData) => {
    try {
      setIsSubmitting(true);
      await createItemCategory(data);
      navigate('/sales-purchase/item-categories');
    } catch (error: any) {
      console.error('Failed to create item category:', error);
      if (error.response?.status === 401) {
        // Let the axios interceptor handle 401
        return;
      }
      alert(error instanceof Error ? error.message : 'Failed to create item category');
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
          <h1 className="text-2xl font-bold text-slate-900">Add Item Category</h1>
          <p className="text-slate-600 mt-1">Create a new item category</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <ItemCategoryForm onSubmit={handleSubmit} submitText="Create Category" isSubmitting={isSubmitting} />
        </div>
      </Card>
    </div>
  );
}
