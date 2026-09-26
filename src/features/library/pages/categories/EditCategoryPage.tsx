import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import CategoryForm from '../../components/categories/CategoryForm';
import { getCategories, updateCategory } from '../../api/library.api';
import type { CategoryFormData } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditCategoryPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: categories = [], isLoading, error, refetch } = useQuery({ queryKey: ['library', 'categories'], queryFn: getCategories });
  const category = categories.find((c) => c.category_id === Number(id));

  const save = useMutation({
    mutationFn: (data: CategoryFormData) => updateCategory(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'books'] });
      toast.success(`“${data.name}” saved`);
      navigate(`/library/categories/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the category')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: category ? `/library/categories/${id}` : '/library/categories', label: category?.name ?? 'Categories' }} title="Edit category" />
      {isLoading ? (
        <FormLoading blocks={1} />
      ) : error || !category ? (
        <ErrorState message={getApiErrorMessage(error, 'Category not found')} onRetry={() => refetch()} />
      ) : (
        <CategoryForm defaultValues={{ name: category.name }} categoryId={category.category_id} onSubmit={(data) => save.mutate(data)} isSubmitting={save.isPending} submitText="Save changes" />
      )}
    </div>
  );
}
