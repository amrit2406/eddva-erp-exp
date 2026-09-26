import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../../../hooks/useToast';
import PurchaseOrderForm from '../../components/purchase-orders/PurchaseOrderForm';
import { createPurchaseOrder } from '../../api/sales-purchase.api';
import type { PurchaseOrderFormData } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

export default function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const create = useMutation({
    mutationFn: (data: PurchaseOrderFormData) => createPurchaseOrder(data),
    onSuccess: (po) => {
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-purchase', 'dashboard'] });
      toast.success(po?.po_number ? `${po.po_number} saved as a draft` : 'Purchase order saved as a draft');
      // Open the new order so it can be checked and sent for approval.
      navigate(po?.po_id ? `/sales-purchase/purchase-orders/${po.po_id}` : '/sales-purchase/purchase-orders');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not create the purchase order')),
  });

  return (
    <div className="space-y-5">
      <Link to="/sales-purchase/purchase-orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> Purchase orders
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New purchase order</h1>
        <p className="mt-0.5 text-sm text-slate-500">Saved as a draft — you can send it for approval afterwards.</p>
      </div>

      <PurchaseOrderForm onSubmit={(data) => create.mutate(data)} isSubmitting={create.isPending} submitText="Save purchase order" />
    </div>
  );
}
