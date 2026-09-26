import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import UOMForm from '../../components/uom/UOMForm';
import { createUOM } from '../../api/sales-purchase.api';
import type { UOMFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateUOMPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: UOMFormData) => createUOM(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'uoms'] });
      toast.success(`Unit “${data.name}” added`);
      navigate('/sales-purchase/uom');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the unit')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/uom', label: 'Units of measure' }} title="New unit" subtitle="A way of counting or weighing items, like Box or Kilogram." />
      <UOMForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add unit" />
    </div>
  );
}
