import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import PartyForm from '../../components/parties/PartyForm';
import { createVendor, getVendors } from '../../api/sales-purchase.api';
import type { VendorFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { partyPayload } from '../../utils/party';

export default function CreateVendorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: vendors = [] } = useQuery({ queryKey: ['sales-purchase', 'vendors'], queryFn: getVendors });

  const create = useMutation({
    mutationFn: (data: VendorFormData) => createVendor(data),
    onSuccess: (vendor, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'vendors'] });
      toast.success(`“${data.vendor_name}” added`);
      // Open the vendor so contacts and bank details can be added next.
      navigate(vendor?.vendor_id ? `/sales-purchase/vendors/${vendor.vendor_id}` : '/sales-purchase/vendors');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add the vendor')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: '/sales-purchase/vendors', label: 'Vendors' }} title="New vendor" subtitle="A supplier you buy from. You can add contacts and bank details after saving." />
      <PartyForm
        kind="vendor"
        takenNames={vendors.map((v) => v.vendor_name)}
        onSubmit={(v) => create.mutate({ vendor_name: v.name, ...partyPayload(v) })}
        isSubmitting={create.isPending}
        submitText="Add vendor"
      />
    </div>
  );
}
