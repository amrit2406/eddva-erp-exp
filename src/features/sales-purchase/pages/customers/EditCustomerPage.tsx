import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import PartyForm from '../../components/parties/PartyForm';
import { getCustomer, getCustomers, updateCustomer } from '../../api/sales-purchase.api';
import type { CustomerFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { partyPayload, toPartyValues } from '../../utils/party';

export default function EditCustomerPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: customer, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'customer', id], queryFn: () => getCustomer(id), enabled: Boolean(id) });
  const { data: customers = [] } = useQuery({ queryKey: ['sales-purchase', 'customers'], queryFn: getCustomers });

  const save = useMutation({
    mutationFn: (data: CustomerFormData) => updateCustomer(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'customers'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'customer', id] });
      toast.success(`“${data.customer_name}” saved`);
      navigate(`/sales-purchase/customers/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the customer')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: customer ? `/sales-purchase/customers/${id}` : '/sales-purchase/customers', label: customer?.customer_name ?? 'Customers' }} title="Edit customer" subtitle="Contacts are managed on the customer's page." />
      {isLoading ? (
        <FormLoading blocks={3} />
      ) : error || !customer ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load customer')} onRetry={() => refetch()} />
      ) : (
        <PartyForm
          kind="customer"
          editing
          defaultValues={toPartyValues(customer.customer_name, customer)}
          takenNames={customers.filter((c) => c.customer_id !== customer.customer_id).map((c) => c.customer_name)}
          onSubmit={(v) => save.mutate({ customer_name: v.name, ...partyPayload(v) })}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}
