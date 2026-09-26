import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { useToast } from '../../../../hooks/useToast';
import ItemCategoryForm from '../../components/item-categories/ItemCategoryForm';
import { getItemCategory, updateItemCategory } from '../../api/sales-purchase.api';
import type { ItemCategoryFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditItemCategoryPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: category, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-purchase', 'item-category', id],
    queryFn: () => getItemCategory(id),
    enabled: Boolean(id),
  });

  const save = useMutation({
    mutationFn: (data: ItemCategoryFormData) => updateItemCategory(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'item-categories'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'item-category', id] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'items'] });
      toast.success(`Category renamed to “${data.name}”`);
      navigate(`/sales-purchase/item-categories/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the category')),
  });

  return (
    <div className="space-y-5">
      <Link to={category ? `/sales-purchase/item-categories/${id}` : '/sales-purchase/item-categories'} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> {category?.name ?? 'Item categories'}
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Rename category</h1>
        <p className="mt-0.5 text-sm text-slate-500">Items in this category will show the new name.</p>
      </div>

      {isLoading ? (
        <div className="skeleton h-32 rounded-3xl" aria-busy="true" aria-label="Loading" />
      ) : error || !category ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load category')} onRetry={() => refetch()} />
      ) : (
        <ItemCategoryForm
          defaultValues={{ name: category.name }}
          categoryId={category.category_id}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save name"
        />
      )}
    </div>
  );
}
