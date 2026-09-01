import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Package, MapPin, User, ShieldCheck, Wrench } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { getAsset } from '../../api/assets.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryAsset } from '../../types/asset.types';
import { cn } from '../../../../utils/cn';

const STATUS_STYLE: Record<string, string> = {
  in_store: 'bg-green-100 text-green-700',
  issued: 'bg-blue-100 text-blue-700',
  under_repair: 'bg-amber-100 text-amber-700',
  disposed: 'bg-slate-200 text-slate-600',
  lost: 'bg-red-100 text-red-700',
};

export default function AssetDetailPage() {
  const { tag } = useParams<{ tag: string }>();
  const [asset, setAsset] = useState<InventoryAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tag) return;
    getAsset(tag)
      .then(setAsset)
      .catch((err) => {
        if (err.response?.status === 401) return;
        setError(getApiErrorMessage(err, 'Failed to load asset'));
      })
      .finally(() => setLoading(false));
  }, [tag]);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!asset) return <div className="text-center py-8 text-slate-500">Asset not found.</div>;

  const activeIssue = asset.issues?.[0];

  return (
    <div className="space-y-6">
      <Link to="/inventory/assets" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to Assets
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 font-mono">
            {asset.asset_tag}
            <span
              className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize font-sans',
                STATUS_STYLE[asset.status] ?? 'bg-slate-100 text-slate-600'
              )}
            >
              {asset.status.replace('_', ' ')}
            </span>
          </h1>
          <p className="text-slate-600 mt-1">{asset.item?.name ?? `Item #${asset.item_id}`}</p>
        </div>
        <Link to={`/inventory/assets/${encodeURIComponent(asset.asset_tag)}/edit`}>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Asset
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Package className="h-3.5 w-3.5" /> Item
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{asset.item?.name ?? `#${asset.item_id}`}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500">Serial Number</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{asset.serial_number || '—'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Location
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{asset.current_location?.name ?? '—'}</p>
        </Card>
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Warranty Expiry
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-1">
            {asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString() : '—'}
          </p>
        </Card>
      </div>

      {(asset.current_holder || activeIssue) && (
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
            <User className="h-3.5 w-3.5" /> Current Holder
          </p>
          <p className="text-sm font-semibold text-slate-900 capitalize">
            {asset.current_holder ? `${asset.current_holder.name} (${asset.current_holder.holder_type})` : activeIssue?.holder?.name ?? '—'}
          </p>
        </Card>
      )}

      {asset.purchase && (
        <Card className="border-slate-200 p-4">
          <p className="text-sm text-slate-500 mb-1">Purchase</p>
          <p className="text-sm text-slate-900">
            Purchase #{asset.purchase.purchase_id} · {new Date(asset.purchase.purchase_date).toLocaleDateString()} · ₹{asset.purchase.unit_price}
          </p>
        </Card>
      )}

      {asset.maintenance && asset.maintenance.length > 0 && (
        <Card className="border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Wrench className="h-5 w-5 text-blue-600" />
              Maintenance History
            </h3>
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Date</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Description</th>
                    <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {asset.maintenance.map((m) => (
                    <tr key={m.maintenance_id} className="border-b border-slate-100">
                      <td className="py-2 px-4 text-sm text-slate-600">{new Date(m.created_at).toLocaleDateString()}</td>
                      <td className="py-2 px-4 text-sm text-slate-900">{m.description}</td>
                      <td className="py-2 px-4 text-sm text-slate-600 capitalize">{m.status.replace('_', ' ')}</td>
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
