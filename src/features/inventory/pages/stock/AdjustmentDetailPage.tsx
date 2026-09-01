import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { getAdjustment } from '../../api/stock.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryStockAdjustment } from '../../types/stock.types';
import { cn } from '../../../../utils/cn';

const REASON_STYLE: Record<string, string> = {
  damaged: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
  lost: 'bg-orange-100 text-orange-700',
  audit_correction: 'bg-blue-100 text-blue-700',
};

export default function AdjustmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [adjustment, setAdjustment] = useState<InventoryStockAdjustment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getAdjustment(id)
      .then(setAdjustment)
      .catch((err) => {
        if (err.response?.status === 401) return;
        setError(getApiErrorMessage(err, 'Failed to load adjustment'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!adjustment) return <div className="text-center py-8 text-slate-500">Adjustment not found.</div>;

  return (
    <div className="space-y-6">
      <Link
        to="/inventory/stock/adjustments"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Adjustments
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Adjustment #{adjustment.adjustment_id}</h1>
          <p className="text-slate-600 mt-1">{new Date(adjustment.created_at).toLocaleString()}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium capitalize',
            REASON_STYLE[adjustment.reason] ?? 'bg-slate-100 text-slate-600'
          )}
        >
          {adjustment.reason.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" /> Item
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{adjustment.item?.name ?? `#${adjustment.item_id}`}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Location
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {adjustment.location?.name ?? `#${adjustment.location_id}`}
          </p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Quantity Change</p>
          <p className={cn('text-sm font-semibold mt-1', adjustment.quantity_delta > 0 ? 'text-green-600' : 'text-red-600')}>
            {adjustment.quantity_delta > 0 ? `+${adjustment.quantity_delta}` : adjustment.quantity_delta}
          </p>
        </Card>
      </div>

      {adjustment.remarks && (
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-1">Remarks</p>
          <p className="text-sm text-slate-900">{adjustment.remarks}</p>
        </Card>
      )}
    </div>
  );
}
