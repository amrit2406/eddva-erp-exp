import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, IndianRupee, Hash } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { getItem } from '../../api/sales-purchase.api';
import type { Item } from '../../types/sales-purchase.types';

export default function ItemDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadItem(id);
    }
  }, [id]);

  const loadItem = async (itemId: string) => {
    try {
      setLoading(true);
      const data = await getItem(itemId);
      setItem(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : !item ? (
        <div className="text-center py-8 text-slate-500">Item not found</div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/sales-purchase/items">
                <Button variant="secondary" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{item.item_name}</h1>
                <p className="text-slate-600 mt-1">{item.item_code}</p>
              </div>
            </div>
            <Link to={`/sales-purchase/items/${item.item_id}/edit`}>
              <Button variant="primary">
                <Edit className="h-4 w-4 mr-2" />
                Edit Item
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-sm font-medium">Purchase Price</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{Number(item.purchase_price || 0).toFixed(2)}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-sm font-medium">Sales Price</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{Number(item.sales_price || 0).toFixed(2)}</div>
              </div>
            </Card>
            <Card className="border-slate-200">
              <div className="p-4">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Hash className="h-4 w-4" />
                  <span className="text-sm font-medium">HSN/SAC Code</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{item.hsn_sac_code || '-'}</div>
              </div>
            </Card>
          </div>

          <Card className="border-slate-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Item Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Category</label>
                  <div className="text-slate-900">{item.category?.name || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Unit of Measure</label>
                  <div className="text-slate-900">{item.uom?.name} ({item.uom?.symbol})</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Tax Code</label>
                  <div className="text-slate-900">{item.tax_code?.name || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Tax Rates</label>
                  <div className="text-slate-900">
                    CGST: {item.tax_code?.cgst_pct}% | SGST: {item.tax_code?.sgst_pct}% | IGST: {item.tax_code?.igst_pct}%
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
