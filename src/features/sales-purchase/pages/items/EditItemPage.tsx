import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import ItemForm from '../../components/items/ItemForm';
import { getItem, updateItem } from '../../api/sales-purchase.api';
import type { ItemFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditItemPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: item, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'item', id], queryFn: () => getItem(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: ItemFormData) => updateItem(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'item', id] });
      toast.success(`“${data.item_name}” saved`);
      navigate(`/sales-purchase/items/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the item')),
  });

  return (
    <div className="space-y-5">
      <PageTitle
        back={{ to: item ? `/sales-purchase/items/${id}` : '/sales-purchase/items', label: item?.item_name ?? 'Items' }}
        title="Edit item"
        subtitle="New prices apply to new orders and invoices, not ones already made."
      />
      {isLoading ? (
        <FormLoading />
      ) : error || !item ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load item')} onRetry={() => refetch()} />
      ) : (
        <ItemForm
          itemId={item.item_id}
          defaultValues={{
            item_name: item.item_name,
            category_id: item.category_id,
            uom_id: item.uom_id,
            hsn_sac_code: item.hsn_sac_code ?? undefined,
            purchase_price: toNumber(item.purchase_price),
            sales_price: toNumber(item.sales_price),
            tax_code_id: item.tax_code_id,
          }}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}
