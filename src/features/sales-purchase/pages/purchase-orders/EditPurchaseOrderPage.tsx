import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { useToast } from '../../../../hooks/useToast';
import PurchaseOrderForm from '../../components/purchase-orders/PurchaseOrderForm';
import { getPurchaseOrder, updatePurchaseOrder } from '../../api/sales-purchase.api';
import type { PurchaseOrder, PurchaseOrderFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

function toFormData(po: PurchaseOrder): PurchaseOrderFormData {
  return {
    vendor_id: po.vendor_id,
    po_date: po.po_date,
    expected_delivery_date: po.expected_delivery_date || '',
    warehouse_id: po.warehouse_id,
    discount: Number(po.discount) || 0,
    items: (po.items || []).map((item) => ({
      item_id: item.item_id,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      tax_code_id: item.tax_code_id,
      line_discount: Number(item.line_discount) || 0,
    })),
  };
}

export default function EditPurchaseOrderPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: po, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-purchase', 'purchase-order', id],
    queryFn: () => getPurchaseOrder(id),
    enabled: Boolean(id),
  });

  const save = useMutation({
    mutationFn: (data: PurchaseOrderFormData) => updatePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-order', id] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-orders'] });
      toast.success(`${po?.po_number ?? 'Purchase order'} updated`);
      navigate(`/sales-purchase/purchase-orders/${id}`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not update the purchase order')),
  });

  const backTo = po ? `/sales-purchase/purchase-orders/${id}` : '/sales-purchase/purchase-orders';

  return (
    <div className="space-y-5">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> {po ? po.po_number : 'Purchase orders'}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{po ? `Edit ${po.po_number}` : 'Edit purchase order'}</h1>
        <p className="mt-0.5 text-sm text-slate-500">Only draft orders can be edited.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-3" aria-busy="true" aria-label="Loading">
          <div className="skeleton h-40 rounded-3xl lg:col-span-3" />
          <div className="skeleton h-56 rounded-3xl lg:col-span-3" />
        </div>
      ) : error || !po ? (
        <ErrorState message={getApiErrorMessage(error, 'Failed to load purchase order')} onRetry={() => refetch()} />
      ) : (
        <PurchaseOrderForm defaultValues={toFormData(po)} onSubmit={(data) => save.mutate(data)} isSubmitting={save.isPending} submitText="Save changes" />
      )}
    </div>
  );
}
