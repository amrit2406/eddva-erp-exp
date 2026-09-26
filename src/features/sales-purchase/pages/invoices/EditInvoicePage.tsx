import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ErrorState from '../../../../components/feedback/ErrorState';
import { NextStep } from '../../../../components/premium/detail/DetailParts';
import { FormLoading } from '../../../../components/premium/form/FormParts';
import PageTitle from '../../../../components/premium/page/PageTitle';
import { useToast } from '../../../../hooks/useToast';
import { toNumber } from '../../../../utils/dashboardFormat';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import { getInvoice, getItems, updateInvoice } from '../../api/sales-purchase.api';
import type { InvoiceFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function EditInvoicePage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: inv, isLoading, error, refetch } = useQuery({ queryKey: ['sales-purchase', 'purchase-invoice', id], queryFn: () => getInvoice(id), enabled: Boolean(id) });
  // Invoice lines store tax rates, not the tax code; recover it from the item's usual code.
  const { data: catalog = [], isLoading: itemsLoading } = useQuery({ queryKey: ['sales-purchase', 'items'], queryFn: getItems });

  const save = useMutation({
    mutationFn: (data: InvoiceFormData) => updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-invoice', id] });
      toast.success(`${inv?.invoice_number ?? 'Invoice'} saved`);
      navigate(`/sales-purchase/invoices/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not save the invoice')),
  });

  return (
    <div className="space-y-5">
      <PageTitle back={{ to: inv ? `/sales-purchase/invoices/${id}` : '/sales-purchase/invoices', label: inv?.invoice_number ?? 'Purchase invoices' }} title={inv ? `Edit ${inv.invoice_number}` : 'Edit invoice'} subtitle="Only draft invoices can be edited. Check each line's tax before saving." />
      {isLoading || itemsLoading ? (
        <FormLoading blocks={3} />
      ) : error || !inv ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load invoice')} onRetry={() => refetch()} />
      ) : inv.status !== 'DRAFT' ? (
        <NextStep tone="bad">This invoice is {inv.status.toLowerCase()}, so it can't be edited any more.</NextStep>
      ) : (
        <InvoiceForm
          defaultValues={{
            vendor_invoice_number: inv.vendor_invoice_number,
            vendor_id: inv.vendor_id,
            purchase_order_id: inv.purchase_order_id ?? undefined,
            grn_id: inv.grn_id ?? undefined,
            invoice_date: inv.invoice_date,
            due_date: inv.due_date ?? undefined,
            discount: toNumber(inv.discount),
            items: (inv.items ?? []).map((l) => ({
              item_id: l.item_id,
              po_item_id: l.po_item_id ?? undefined,
              grn_item_id: l.grn_item_id ?? undefined,
              quantity: toNumber(l.quantity),
              unit_price: toNumber(l.unit_price),
              tax_code_id: catalog.find((i) => i.item_id === l.item_id)?.tax_code_id ?? 0,
              line_discount: toNumber(l.line_discount),
            })),
          }}
          onSubmit={(data) => save.mutate(data)}
          isSubmitting={save.isPending}
          submitText="Save changes"
        />
      )}
    </div>
  );
}
