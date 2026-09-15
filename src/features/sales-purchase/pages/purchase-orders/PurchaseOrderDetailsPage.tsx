import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, ShoppingCart, Calendar, Building2, Package, CheckCircle, XCircle, Clock, Ban } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getPurchaseOrder, submitPurchaseOrder, approvePurchaseOrder, rejectPurchaseOrder, cancelPurchaseOrder } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { PurchaseOrder } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'APPROVED':
    case 'CLOSED':
      return 'bg-green-100 text-green-800';
    case 'SUBMITTED':
      return 'bg-yellow-100 text-yellow-800';
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadPurchaseOrder(id);
    }
  }, [id]);

  async function loadPurchaseOrder(poId: string) {
    try {
      setLoading(true);
      const data = await getPurchaseOrder(poId);
      setPurchaseOrder(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load purchase order');
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (action: () => Promise<unknown>) => {
    if (!id) return;
    try {
      setActionLoading(true);
      await action();
      await loadPurchaseOrder(id);
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(error, 'Action failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    if (!purchaseOrder) return;
    const reason = window.prompt('Reason for rejecting this purchase order (optional):');
    if (reason === null) return;
    handleAction(() => rejectPurchaseOrder(purchaseOrder.po_id, reason || undefined));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/purchase-orders">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Purchase Order Details</h1>
          <p className="text-slate-600 mt-1">View purchase order information</p>
        </div>
        {purchaseOrder?.status === 'DRAFT' && (
          <Link to={`/sales-purchase/purchase-orders/${id}/edit`}>
            <Button variant="primary" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-slate-500">Loading...</div>
        </Card>
      ) : error ? (
        <Card className="border-slate-200">
          <div className="p-8 text-center text-red-500">{error}</div>
        </Card>
      ) : purchaseOrder ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm font-medium">PO Number</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{purchaseOrder.po_number}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Vendor</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{purchaseOrder.vendor?.vendor_name || '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">PO Date</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{purchaseOrder.po_date ? new Date(purchaseOrder.po_date).toLocaleDateString() : '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold', statusBadgeClass(purchaseOrder.status))}>
                  {purchaseOrder.status === 'DRAFT' && <Clock className="h-4 w-4" />}
                  {(purchaseOrder.status === 'APPROVED' || purchaseOrder.status === 'CLOSED') && <CheckCircle className="h-4 w-4" />}
                  {purchaseOrder.status === 'REJECTED' && <XCircle className="h-4 w-4" />}
                  {purchaseOrder.status === 'CANCELLED' && <Ban className="h-4 w-4" />}
                  {purchaseOrder.status}
                </span>
                {purchaseOrder.status === 'REJECTED' && purchaseOrder.rejection_reason && (
                  <p className="text-xs text-slate-500 mt-2">Reason: {purchaseOrder.rejection_reason}</p>
                )}
              </div>
            </Card>
          </div>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {purchaseOrder.status === 'DRAFT' && (
                  <Button variant="primary" size="sm" disabled={actionLoading} onClick={() => handleAction(() => submitPurchaseOrder(purchaseOrder.po_id))}>
                    Submit
                  </Button>
                )}
                {purchaseOrder.status === 'SUBMITTED' && (
                  <>
                    <Button variant="primary" size="sm" disabled={actionLoading} onClick={() => handleAction(() => approvePurchaseOrder(purchaseOrder.po_id))}>
                      Approve
                    </Button>
                    <Button variant="secondary" size="sm" disabled={actionLoading} onClick={handleReject}>
                      Reject
                    </Button>
                  </>
                )}
                {(purchaseOrder.status === 'DRAFT' || purchaseOrder.status === 'SUBMITTED') && (
                  <Button variant="secondary" size="sm" disabled={actionLoading} onClick={() => handleAction(() => cancelPurchaseOrder(purchaseOrder.po_id))}>
                    Cancel
                  </Button>
                )}
                {!['DRAFT', 'SUBMITTED'].includes(purchaseOrder.status) && (
                  <p className="text-sm text-slate-500">No actions available for this status.</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Item</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Quantity</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Unit Price</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Line Discount</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Tax</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(purchaseOrder.items || []).map((item) => (
                      <tr key={item.po_item_id} className="border-b border-slate-100">
                        <td className="py-2 px-4 text-sm text-slate-900">{item.item?.item_name || item.item_id}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">{item.quantity}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">{Number(item.unit_price).toFixed(2)}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">{Number(item.line_discount || 0).toFixed(2)}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">{Number(item.line_tax_amount || 0).toFixed(2)}</td>
                        <td className="py-2 px-4 text-sm text-slate-900 text-right">{Number(item.line_total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">{Number(purchaseOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-slate-900">{Number(purchaseOrder.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-900">{Number(purchaseOrder.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-slate-200 pt-2">
                  <span className="text-slate-900">Grand Total</span>
                  <span className="text-slate-900">{Number(purchaseOrder.grand_total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
