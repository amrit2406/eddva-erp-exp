import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import TaxCodeForm from '../../components/tax-codes/TaxCodeForm';
import { createTaxCode } from '../../api/sales-purchase.api';
import type { TaxCodeFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreateTaxCodePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: TaxCodeFormData) => createTaxCode(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'tax-codes'] });
      toast.success(`${data.name} added`);
      navigate('/sales-purchase/tax-codes');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the tax code')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/tax-codes', label: 'Tax codes' }} title="New tax code" subtitle="A GST rate you can apply to items and invoices." />
      <TaxCodeForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add tax code" />
    </div>
  );
}
