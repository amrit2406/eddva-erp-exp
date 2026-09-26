import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../../../hooks/useToast';
import ItemCategoryForm from '../../components/item-categories/ItemCategoryForm';
import { createItemCategory } from '../../api/sales-purchase.api';
import type { ItemCategoryFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateItemCategoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const create = useMutation({
    mutationFn: (data: ItemCategoryFormData) => createItemCategory(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'item-categories'] });
      toast.success(`Category “${data.name}” added`);
      navigate('/sales-purchase/item-categories');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the category')),
  });

  return (
    <div className="space-y-5">
      <Link to="/sales-purchase/item-categories" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> Item categories
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New category</h1>
        <p className="mt-0.5 text-sm text-slate-500">A group for similar items, like Stationery or Furniture.</p>
      </div>
      <ItemCategoryForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add category" />
    </div>
  );
}
