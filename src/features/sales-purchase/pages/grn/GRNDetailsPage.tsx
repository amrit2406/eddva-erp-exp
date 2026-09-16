import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Package, Calendar, ShoppingCart, Building2, CheckCircle, Ban, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getGRN, getPurchaseOrder, postGRN, cancelGRN } from '../../api/sales-purchase.api';
import { getApiErrorMessage } from '../../utils/errors';
import { cn } from '../../../../utils/cn';
import type { GRN, PurchaseOrderItem } from '../../types/sales-purchase.types';

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'POSTED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

export default function GRNDetailsPage() {
  const { id } = useParams();
  const [grn, setGRN] = useState<GRN | null>(null);
  const [poItemsMap, setPoItemsMap] = useState<Map<number, PurchaseOrderItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadGRN(id);
    }
  }, [id]);

  async function loadGRN(grnId: string) {
    try {
      setLoading(true);
      const data = await getGRN(grnId);
      setGRN(data);
      if (data.purchase_order_id) {
        try {
          const po = await getPurchaseOrder(data.purchase_order_id);
          setPoItemsMap(new Map((po.items || []).map((item) => [item.po_item_id, item])));
        } catch (err) {
          console.error('Failed to load purchase order items:', err);
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load GRN'));
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (action: () => Promise<unknown>) => {
    if (!id) return;
    try {
      setActionLoading(true);
      await action();
      await loadGRN(id);
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      alert(getApiErrorMessage(error, 'Action failed'));
    } finally {
      setActionLoading(false);
    }
  };

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
        {grn?.status === 'DRAFT' && (
          <Link to={`/sales-purchase/grn/${id}/edit`}>
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
      ) : grn ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">GRN Number</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{grn.grn_number}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm font-medium">Purchase Order</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{grn.purchase_order?.po_number || '-'}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">GRN Date</span>
                </div>
                <div className="text-lg font-bold text-slate-900">{grn.received_date ? new Date(grn.received_date).toLocaleDateString() : '-'}</div>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Actions</h3>
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold', statusBadgeClass(grn.status))}>
                  {grn.status === 'DRAFT' && <Clock className="h-4 w-4" />}
                  {grn.status === 'POSTED' && <CheckCircle className="h-4 w-4" />}
                  {grn.status === 'CANCELLED' && <Ban className="h-4 w-4" />}
                  {grn.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {grn.status === 'DRAFT' && (
                  <>
                    <Button variant="primary" size="sm" disabled={actionLoading} onClick={() => handleAction(() => postGRN(grn.grn_id))}>
                      Post
                    </Button>
                    <Button variant="secondary" size="sm" disabled={actionLoading} onClick={() => handleAction(() => cancelGRN(grn.grn_id))}>
                      Cancel
                    </Button>
                  </>
                )}
                {grn.status !== 'DRAFT' && (
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
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Ordered Qty</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Received Qty</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Accepted Qty</th>
                      <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Rejected Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(grn.items || []).map((item) => {
                      const poItem = poItemsMap.get(item.po_item_id);
                      return (
                        <tr key={item.grn_item_id} className="border-b border-slate-100">
                          <td className="py-2 px-4 text-sm text-slate-900">{item.item?.item_name || poItem?.item?.item_name || item.item_id}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{poItem?.quantity ?? '-'}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{item.received_qty}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{item.accepted_qty}</td>
                          <td className="py-2 px-4 text-sm text-slate-900 text-right">{item.rejected_qty}</td>
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
