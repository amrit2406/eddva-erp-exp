import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import ItemForm from '../../components/items/ItemForm';
import { createItem } from '../../api/sales-purchase.api';
import type { ItemFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateItemPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: ItemFormData) => createItem(data),
    onSuccess: (item, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'items'] });
      toast.success(`“${data.item_name}” added`);
      navigate(item?.item_id ? `/sales-purchase/items/${item.item_id}` : '/sales-purchase/items');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the item')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/items', label: 'Items' }} title="New item" subtitle="Something you buy or sell. Its code is created for you." />
      <ItemForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add item" />
    </div>
  );
}
