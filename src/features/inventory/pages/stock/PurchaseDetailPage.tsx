import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, MapPin, Tag } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { getPurchase } from '../../api/stock.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryStockPurchase } from '../../types/stock.types';
import { cn } from '../../../../utils/cn';

export default function PurchaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [purchase, setPurchase] = useState<InventoryStockPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getPurchase(id)
      .then(setPurchase)
      .catch((err) => {
        if (err.response?.status === 401) return;
        setError(getApiErrorMessage(err, 'Failed to load purchase'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!purchase) return <div className="text-center py-8 text-slate-500">Purchase not found.</div>;

  return (
    <div className="space-y-6">
      <Link
        to="/inventory/stock/purchases"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Purchases
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Purchase #{purchase.purchase_id}</h1>
        <p className="text-slate-600 mt-1">{new Date(purchase.purchase_date).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" /> Item
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{purchase.item?.name ?? `#${purchase.item_id}`}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" /> Vendor
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{purchase.vendor?.name ?? `#${purchase.vendor_id}`}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Location
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{purchase.location?.name ?? `#${purchase.location_id}`}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Quantity</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{purchase.quantity}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Unit Price</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">₹{purchase.unit_price}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total Amount</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">₹{purchase.total_amount}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Invoice Number</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{purchase.invoice_number || '—'}</p>
        </Card>
      </div>

      {purchase.asset_units && purchase.asset_units.length > 0 && (
        <Card className="border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-blue-600" />
              Asset Units Created
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Asset Tag</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchase.asset_units.map((au) => (
                    <tr key={au.asset_unit_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-900 font-mono">{au.asset_tag}</td>
                      <td className="py-2 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                            au.status === 'in_store' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {au.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
