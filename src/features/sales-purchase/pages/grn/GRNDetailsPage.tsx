import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Package, Calendar, ShoppingCart, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getGRN, getItems } from '../../api/sales-purchase.api';
import type { GRN, Item } from '../../types/sales-purchase.types';

export default function GRNDetailsPage() {
  const { id } = useParams();
  const [grn, setGRN] = useState<GRN | null>(null);
  const [itemsMap, setItemsMap] = useState<Map<string, Item>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadGRN(id);
      loadItems();
    }
  }, [id]);

  async function loadGRN(grnId: string) {
    try {
      setLoading(true);
      const data = await getGRN(grnId);
      setGRN(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load GRN');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/sales-purchase/grn">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">GRN Details</h1>
          <p className="text-slate-600 mt-1">View goods received note information</p>
        </div>
        <Link to={`/sales-purchase/grn/${id}/edit`}>
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
      ) : grn ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">GRN Number</span>
                </div>
                <div className="text-lg font-bold text-slate-900">GRN-{grn.id.slice(0, 8)}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm font-medium">Purchase Order</span>
                </div>
                <div className="text-lg font-bold text-slate-900">PO-{grn.purchaseOrderId?.slice(0, 8) || '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">GRN Date</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{grn.grnDate ? new Date(grn.grnDate).toLocaleDateString() : '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Warehouse</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{grn.warehouse?.name || '-'}</div>
              </div>
            </Card>
          </div>

          <Card className="border-slate-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Item</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Ordered Qty</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Received Qty</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Unit Price</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grn.items.map((item, index) => {
                      const itemDetails = itemsMap.get(item.itemId);
                      return (
                        <tr key={index} className="border-b border-slate-100">
                          <td className="py-2 px-4 text-sm text-slate-900">{itemDetails?.itemName || item.itemId}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{item.quantity}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{item.receivedQuantity}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{item.unitPrice.toFixed(2)}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{(item.receivedQuantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
