import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import CategoryForm from '../../components/menu/CategoryForm';
import { createMenuCategory } from '../../api/canteen.api';
import type { MenuCategoryFormData } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateMenuCategoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: MenuCategoryFormData) => createMenuCategory(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-categories'] });
      toast.success(`“${data.name}” added`);
      navigate('/canteen/menu/categories');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the category')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/canteen/menu/categories', label: 'Menu categories' }} title="New category" subtitle="A group of items on the menu." />
      <CategoryForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add category" />
    </div>
  );
}
