import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import WarehouseForm from '../../components/warehouses/WarehouseForm';
import { createWarehouse } from '../../api/sales-purchase.api';
import type { WarehouseFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateWarehousePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: WarehouseFormData) => createWarehouse(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'warehouses'] });
      toast.success(`“${data.name}” added`);
      navigate('/sales-purchase/warehouses');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the warehouse')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/warehouses', label: 'Warehouses' }} title="New warehouse" subtitle="A store where purchased goods are delivered." />
      <WarehouseForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add warehouse" />
    </div>
  );
}
