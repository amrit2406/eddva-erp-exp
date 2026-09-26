import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import WarehouseForm from '../../components/warehouses/WarehouseForm';
import { getWarehouse, updateWarehouse } from '../../api/sales-purchase.api';
import type { WarehouseFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditWarehousePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: warehouse, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'warehouse', id], queryFn: () => getWarehouse(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: WarehouseFormData) => updateWarehouse(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'warehouse', id] });
      toast.success(`“${data.name}” saved`);
      navigate(`/sales-purchase/warehouses/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the warehouse')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: warehouse ? `/sales-purchase/warehouses/${id}` : '/sales-purchase/warehouses', label: warehouse?.name ?? 'Warehouses' }} title="Edit warehouse" />
      {isLoading ? (
        <FormLoading blocks={1} />
      ) : error || !warehouse ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load warehouse')} onRetry={() => refetch()} />
      ) : (
        <WarehouseForm
          defaultValues={{ name: warehouse.name, address: warehouse.address ?? '', is_default: warehouse.is_default }}
          warehouseId={warehouse.warehouse_id}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}
