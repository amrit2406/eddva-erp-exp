import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Building2, Calendar, IndianRupee, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getSalesOrder, confirmSalesOrder, cancelSalesOrder } from '../../api/sales-purchase.api';
import type { SalesOrder } from '../../types/sales-purchase.types';

export default function SalesOrderDetailsPage() {
  const { id } = useParams();
  const [salesOrder, setSalesOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(err instanceof Error ? err.message : 'Failed to load sales order');
    } finally {
      setLoading(false);
    }
  }

  const handleConfirm = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to confirm this sales order?')) {
      return;
    }
    try {
      await confirmSalesOrder(id);
      loadSalesOrder(id);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to confirm sales order');
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to cancel this sales order?')) {
      return;
    }
    try {
      await cancelSalesOrder(id);
      loadSalesOrder(id);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      alert(err instanceof Error ? err.message : 'Failed to cancel sales order');
    }
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
        <Link to={`/sales-purchase/sales-orders/${id}/edit`}>
          <Button variant="primary" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>
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
                <h3 className="text-lg font-semibold text-slate-900">Sales Order Information</h3>
                <div className="flex gap-2">
                  {salesOrder.status !== 'CONFIRMED' && salesOrder.status !== 'CANCELLED' && (
                    <>
                      <Button variant="primary" size="sm" onClick={handleConfirm}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm
                      </Button>
                      <Button variant="danger" size="sm" onClick={handleCancel}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Customer</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-slate-400" />
                    <p className="text-lg font-medium text-slate-900">{salesOrder.customer?.customerName || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Status</label>
                  <p className="mt-1 text-slate-900">{salesOrder.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">SO Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{new Date(salesOrder.soDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Delivery Date</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{new Date(salesOrder.deliveryDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Discount</label>
                  <div className="mt-1 flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    <p className="text-slate-900">{Number(salesOrder.discount).toFixed(2)}</p>
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Quantity</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Unit Price</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesOrder.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-900">{item.itemId}</td>
                        <td className="py-3 px-4 text-slate-900">{Number(item.quantity)}</td>
                        <td className="py-3 px-4 text-slate-900">₹{Number(item.unitPrice).toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-900">₹{(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">Sales Order ID</label>
                  <p className="mt-1 text-slate-900">{salesOrder.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Created At</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <p className="text-slate-900">{salesOrder.createdAt ? new Date(salesOrder.createdAt).toLocaleString() : '-'}</p>
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
