import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import CategoryForm from '../../components/menu/CategoryForm';
import { getMenuCategory, updateMenuCategory } from '../../api/canteen.api';
import type { MenuCategoryFormData } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditMenuCategoryPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: category, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'menu-category', id], queryFn: () => getMenuCategory(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: MenuCategoryFormData) => updateMenuCategory(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-categories'] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-category', id] });
      toast.success(`“${data.name}” saved`);
      navigate(`/canteen/menu/categories/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the category')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: category ? `/canteen/menu/categories/${id}` : '/canteen/menu/categories', label: category?.name ?? 'Menu categories' }} title="Edit category" />
      {isLoading ? (
        <FormLoading blocks={1} />
      ) : error || !category ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load category')} onRetry={() => refetch()} />
      ) : (
        <CategoryForm
          defaultValues={{ name: category.name, displayOrder: category.displayOrder }}
          categoryId={category.id}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}
