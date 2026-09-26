import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import PaymentTermForm from '../../components/payment-terms/PaymentTermForm';
import { createPaymentTerm } from '../../api/sales-purchase.api';
import type { PaymentTermFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreatePaymentTermPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const create = useMutation({
    mutationFn: (data: PaymentTermFormData) => createPaymentTerm(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'payment-terms'] });
      toast.success(`“${data.term_name}” added`);
      navigate('/sales-purchase/payment-terms');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the payment term')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/payment-terms', label: 'Payment terms' }} title="New payment term" subtitle="How many days someone gets to pay an invoice." />
      <PaymentTermForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Add term" />
    </div>
  );
}
