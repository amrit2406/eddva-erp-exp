import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, Calendar, IndianRupee, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getSalesOrder, confirmSalesOrder, cancelSalesOrder } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cn } from '../../../../utils/cn';
import type { SalesOrder } from '../../types/sales-purchase.types';

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'CONFIRMED':
    case 'CLOSED':
      return 'bg-green-100 text-green-800';
    case 'PARTIALLY_INVOICED':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

export default function SalesOrderDetailsPage() {
  const { id } = useParams();
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadSalesOrder(id);
    }
  }, [id]);

  async function loadSalesOrder(salesOrderId: string) {
    try {
      setLoading(true);
      const data = await getSalesOrder(salesOrderId);
      setSalesOrder(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load sales order'));
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (action: () => Promise<unknown>) => {
    if (!id) return;
    try {
      setActionLoading(true);
      await action();
      await loadSalesOrder(id);
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(error, 'Action failed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!salesOrder) return;
    if (!window.confirm('Are you sure you want to confirm this sales order?')) return;
    handleAction(() => confirmSalesOrder(salesOrder.so_id));
  };

  const handleCancel = () => {
    if (!salesOrder) return;
    if (!window.confirm('Are you sure you want to cancel this sales order?')) return;
    handleAction(() => cancelSalesOrder(salesOrder.so_id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/sales-orders">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Sales Order Details</h1>
          <p className="text-slate-600 mt-1">View sales order information</p>
        </div>
        {salesOrder?.status === 'DRAFT' && (
          <Link to={`/sales-purchase/sales-orders/${id}/edit`}>
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
      ) : salesOrder ? (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{salesOrder.so_number}</h3>
                <div className="flex gap-2">
                  {salesOrder.status === 'DRAFT' && (
                    <>
                      <Button variant="primary" size="sm" disabled={actionLoading} onClick={handleConfirm}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm
                      </Button>
                      <Button variant="danger" size="sm" disabled={actionLoading} onClick={handleCancel}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                  {salesOrder.status === 'CONFIRMED' && (
                    <Button variant="danger" size="sm" disabled={actionLoading} onClick={handleCancel}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Customer</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{salesOrder.customer?.customer_name || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <p className="mt-1">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium', statusBadgeClass(salesOrder.status))}>
                      {salesOrder.status}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">SO Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{salesOrder.so_date ? new Date(salesOrder.so_date).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Delivery Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{salesOrder.delivery_date ? new Date(salesOrder.delivery_date).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Item</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Quantity</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Unit Price</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Line Discount</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(salesOrder.items || []).map((item) => (
                      <tr key={item.so_item_id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-900">{item.item?.item_name || item.item_id}</td>
                        <td className="py-3 px-4 text-slate-900 text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-slate-900 text-right">{Number(item.unit_price).toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-900 text-right">{Number(item.line_discount || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-900 text-right">{Number(item.line_total).toFixed(2)}</td>
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
                  <span className="text-slate-900">{Number(salesOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-slate-900">{Number(salesOrder.discount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="text-slate-900">{Number(salesOrder.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-slate-200 pt-2">
                  <span className="text-slate-900">Grand Total</span>
                  <span className="text-slate-900 flex items-center gap-1">
                    <IndianRupee className="h-4 w-4" />
                    {Number(salesOrder.grand_total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Sales Order ID</label>
                  <p className="mt-1 text-slate-900">{salesOrder.so_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{salesOrder.created_at ? new Date(salesOrder.created_at).toLocaleString() : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
