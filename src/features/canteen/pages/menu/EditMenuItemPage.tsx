import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import ItemForm from '../../components/menu/ItemForm';
import { getMenuItem, updateMenuItem } from '../../api/canteen.api';
import type { MenuItemFormData } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditMenuItemPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: item, isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'menu-item', id], queryFn: () => getMenuItem(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: MenuItemFormData) => updateMenuItem(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-item', id] });
      queryClient.invalidateQueries({ queryKey: ['canteen', 'menu-categories'] });
      toast.success(`“${data.name}” saved`);
      navigate(`/canteen/menu/items/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the item')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: item ? `/canteen/menu/items/${id}` : '/canteen/menu/items', label: item?.name ?? 'Menu items' }} title="Edit menu item" />
      {isLoading ? (
        <FormLoading blocks={3} />
      ) : error || !item ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load menu item')} onRetry={() => refetch()} />
      ) : (
        <ItemForm
          defaultValues={{
            categoryId: item.categoryId,
            name: item.name,
            description: item.description ?? '',
            price: toNumber(item.price),
            taxRate: toNumber(item.taxRate),
            foodType: item.foodType,
            imageUrl: item.imageUrl ?? '',
            isAvailable: item.isAvailable,
            availableDays: item.availableDays ?? '',
          }}
          itemId={item.id}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}
