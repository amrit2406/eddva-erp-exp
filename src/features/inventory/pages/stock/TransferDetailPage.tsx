import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, ArrowRight } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import { getTransfer } from '../../api/stock.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryStockTransfer } from '../../types/stock.types';

export default function TransferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [transfer, setTransfer] = useState<InventoryStockTransfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getTransfer(id)
      .then(setTransfer)
      .catch((err) => {
        if (err.response?.status === 401) return;
        setError(getApiErrorMessage(err, 'Failed to load transfer'));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!transfer) return <div className="text-center py-8 text-slate-500">Transfer not found.</div>;

  return (
    <div className="space-y-6">
      <Link
        to="/inventory/stock/transfers"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Transfers
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transfer #{transfer.transfer_id}</h1>
        <p className="text-slate-600 mt-1">{new Date(transfer.transfer_date).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" /> Item
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{transfer.item?.name ?? `#${transfer.item_id}`}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Quantity</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{transfer.quantity}</p>
        </Card>
      </div>

      <Card className="border-slate-200 p-4">
        <p className="text-sm text-slate-500 mb-2">Route</p>
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400" />
            {transfer.from_location?.name ?? `#${transfer.from_location_id}`}
          </span>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400" />
            {transfer.to_location?.name ?? `#${transfer.to_location_id}`}
          </span>
        </div>
      </Card>
    </div>
  );
}
