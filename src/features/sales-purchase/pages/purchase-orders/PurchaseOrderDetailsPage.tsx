import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, ShoppingCart, Calendar, Building2, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getPurchaseOrder, submitPurchaseOrder, approvePurchaseOrder, rejectPurchaseOrder, cancelPurchaseOrder, getItems } from '../../api/sales-purchase.api';
import type { PurchaseOrder, Item } from '../../types/sales-purchase.types';

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [itemsMap, setItemsMap] = useState<Map<string, Item>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPurchaseOrder(id);
      loadItems();
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

  async function loadItems() {
    try {
      const data = await getItems();
      const map = new Map(data.map((item) => [item.id, item]));
      setItemsMap(map);
    } catch (err) {
      console.error('Failed to load items:', err);
    }
  }

  const handleAction = async (action: () => Promise<void>) => {
    try {
      await action();
      if (id) loadPurchaseOrder(id);
    } catch (error: any) {
      console.error('Action failed:', error);
      alert('Action failed');
    }
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
        <Link to={`/sales-purchase/purchase-orders/${id}/edit`}>
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
      ) : purchaseOrder ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm font-medium">PO Number</span>
                </div>
                <div className="text-lg font-bold text-slate-900">PO-{purchaseOrder.id.slice(0, 8)}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Vendor</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{purchaseOrder.vendor?.vendorName || '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">PO Date</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{purchaseOrder.poDate ? new Date(purchaseOrder.poDate).toLocaleDateString() : '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  {purchaseOrder.status === 'DRAFT' && <Clock className="h-4 w-4 text-slate-400" />}
                  {purchaseOrder.status === 'APPROVED' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {purchaseOrder.status === 'REJECTED' && <XCircle className="h-4 w-4 text-red-500" />}
                  <span className="text-lg font-bold text-slate-900">{purchaseOrder.status}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>
              <div className="flex flex-wrap gap-2">
                {purchaseOrder.status === 'DRAFT' && (
                  <>
                    <Button variant="primary" size="sm" onClick={() => handleAction(() => submitPurchaseOrder(purchaseOrder.id))}>
                      Submit
                    </Button>
                  </>
                )}
                {purchaseOrder.status === 'SUBMITTED' && (
                  <>
                    <Button variant="primary" size="sm" onClick={() => handleAction(() => approvePurchaseOrder(purchaseOrder.id))}>
                      Approve
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAction(() => rejectPurchaseOrder(purchaseOrder.id))}>
                      Reject
                    </Button>
                  </>
                )}
                {(purchaseOrder.status === 'DRAFT' || purchaseOrder.status === 'SUBMITTED') && (
                  <Button variant="secondary" size="sm" onClick={() => handleAction(() => cancelPurchaseOrder(purchaseOrder.id))}>
                    Cancel
                  </Button>
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
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.items.map((item, index) => {
                      const itemDetails = itemsMap.get(item.itemId);
                      const unitPrice = Number(item.unitPrice) || 0;
                      return (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-2 px-4 text-sm text-slate-900">{itemDetails?.itemName || item.itemId}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{item.quantity}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{(item.quantity * unitPrice).toFixed(2)}</td>
                        </tr>
                      );
                    })}
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
                  <span className="text-slate-900">{purchaseOrder.items.reduce((sum, item) => sum + (item.quantity * (Number(item.unitPrice) || 0)), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Discount</span>
                  <span className="text-slate-900">{(Number(purchaseOrder.discount) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-slate-200 pt-2">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">{(purchaseOrder.items.reduce((sum, item) => sum + (item.quantity * (Number(item.unitPrice) || 0)), 0) - (Number(purchaseOrder.discount) || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
