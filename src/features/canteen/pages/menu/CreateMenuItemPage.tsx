import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import ItemForm from '../../components/menu/ItemForm';
import { createMenuItem } from '../../api/canteen.api';
import type { MenuItemFormData } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateMenuItemPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Opened from a category page: start with that category chosen.
  const [searchParams] = useSearchParams();

  const create = useMutation({
    mutationFn: (data: MenuItemFormData) => createMenuItem(data),
    onSuccess: (item, data) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-categories'] });
      toast.success(`“${data.name}” added to the menu`);
      navigate(item?.id ? `/canteen/menu/items/${item.id}` : '/canteen/menu/items');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the item')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/canteen/menu/items', label: 'Menu items' }} title="New menu item" subtitle="Something the canteen sells." />
      <ItemForm
        initialCategoryId={searchParams.get('categoryId') ?? undefined}
        onSubmit={(data) => create.mutate(data)}
        isSubmitting={create.isPending}
        submitText="Add item"
      />
    </div>
  );
}
