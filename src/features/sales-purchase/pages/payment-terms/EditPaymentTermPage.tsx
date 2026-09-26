import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import PaymentTermForm from '../../components/payment-terms/PaymentTermForm';
import { getPaymentTerm, updatePaymentTerm } from '../../api/sales-purchase.api';
import type { PaymentTermFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditPaymentTermPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: term, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'payment-term', id], queryFn: () => getPaymentTerm(id), enabled: Boolean(id) });

  const save = useMutation({
    mutationFn: (data: PaymentTermFormData) => updatePaymentTerm(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'payment-terms'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'payment-term', id] });
      toast.success(`“${data.term_name}” saved`);
      navigate(`/sales-purchase/payment-terms/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the payment term')),
  });

  return (
    <div className="space-y-5">
      <PageTitle
        back={{ to: term ? `/sales-purchase/payment-terms/${id}` : '/sales-purchase/payment-terms', label: term?.term_name ?? 'Payment terms' }}
        title="Edit payment term"
        subtitle="Applies to new invoices for vendors and customers on this term."
      />
      {isLoading ? (
        <FormLoading blocks={1} />
      ) : error || !term ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load payment term')} onRetry={() => refetch()} />
      ) : (
        <PaymentTermForm
          defaultValues={{ term_name: term.term_name, days: term.days }}
          termId={term.payment_term_id}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}
