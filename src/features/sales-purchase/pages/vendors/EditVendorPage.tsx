import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import PartyForm from '../../components/parties/PartyForm';
import { getVendor, getVendors, updateVendor } from '../../api/sales-purchase.api';
import type { VendorFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { partyPayload, toPartyValues } from '../../utils/party';

export default function EditVendorPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: vendor, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'vendor', id], queryFn: () => getVendor(id), enabled: Boolean(id) });
  const { data: vendors = [] } = useQuery({ queryKey: ['sales-purchase', 'vendors'], queryFn: getVendors });

  const save = useMutation({
    mutationFn: (data: VendorFormData) => updateVendor(id, data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'vendor', id] });
      toast.success(`“${data.vendor_name}” saved`);
      navigate(`/sales-purchase/vendors/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the vendor')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: vendor ? `/sales-purchase/vendors/${id}` : '/sales-purchase/vendors', label: vendor?.vendor_name ?? 'Vendors' }} title="Edit vendor" subtitle="Contacts and bank details are managed on the vendor's page." />
      {isLoading ? (
        <FormLoading blocks={3} />
      ) : error || !vendor ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load vendor')} onRetry={() => refetch()} />
      ) : (
        <PartyForm
          kind="vendor"
          editing
          defaultValues={toPartyValues(vendor.vendor_name, vendor)}
          takenNames={vendors.filter((v) => v.vendor_id !== vendor.vendor_id).map((v) => v.vendor_name)}
          onSubmit={(v) => save.mutate({ vendor_name: v.name, ...partyPayload(v) })}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}
