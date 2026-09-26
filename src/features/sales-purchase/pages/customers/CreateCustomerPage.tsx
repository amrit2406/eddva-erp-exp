import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import PartyForm from '../../components/parties/PartyForm';
import { createCustomer, getCustomers } from '../../api/sales-purchase.api';
import type { CustomerFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { partyPayload } from '../../utils/party';

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: customers = [] } = useQuery({ queryKey: ['sales-purchase', 'customers'], queryFn: getCustomers });

  const create = useMutation({
    mutationFn: (data: CustomerFormData) => createCustomer(data),
    onSuccess: (customer, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'customers'] });
      toast.success(`“${data.customer_name}” added`);
      navigate(customer?.customer_id ? `/sales-purchase/customers/${customer.customer_id}` : '/sales-purchase/customers');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the customer')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/customers', label: 'Customers' }} title="New customer" subtitle="Someone you sell to. You can add contacts after saving." />
      <PartyForm
        kind="customer"
        takenNames={customers.map((c) => c.customer_name)}
        onSubmit={(v) => create.mutate({ customer_name: v.name, ...partyPayload(v) })}
        isSubmitting={create.isPending}
        submitText="Add customer"
      />
    </div>
  );
}
