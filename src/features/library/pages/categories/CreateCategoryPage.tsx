import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import CategoryForm from '../../components/categories/CategoryForm';
import { createCategory } from '../../api/library.api';
import type { CategoryFormData } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateCategoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: CategoryFormData) => createCategory(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'categories'] });
      toast.success(`“${data.name}” added`);
      navigate('/library/categories');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the category')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/library/categories', label: 'Categories' }} title="New category" subtitle="A subject that groups books together." />
      <CategoryForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add category" />
    </div>
  );
}
