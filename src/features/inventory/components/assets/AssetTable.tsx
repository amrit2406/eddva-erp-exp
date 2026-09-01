import { Link } from 'react-router-dom';
import { Edit, Package, MapPin, User } from 'lucide-react';
import type { InventoryAsset } from '../../types/asset.types';
import { cn } from '../../../../utils/cn';

interface AssetTableProps {
  assets: InventoryAsset[];
  className?: string;
}

const STATUS_STYLE: Record<string, string> = {
  in_store: 'bg-green-100 text-green-700',
  issued: 'bg-blue-100 text-blue-700',
  under_repair: 'bg-amber-100 text-amber-700',
  disposed: 'bg-slate-200 text-slate-600',
  lost: 'bg-red-100 text-red-700',
};

export default function AssetTable({ assets, className }: AssetTableProps) {
  const assetsArray = Array.isArray(assets) ? assets : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Asset Tag</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Serial Number</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Location</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Holder</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assetsArray.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No assets found.
              </td>
            </tr>
          ) : (
            assetsArray.map((asset) => (
              <tr key={asset.asset_unit_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link
                    to={`/inventory/assets/${encodeURIComponent(asset.asset_tag)}`}
                    className="font-medium text-slate-900 font-mono hover:underline"
                  >
                    {asset.asset_tag}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                    {asset.item?.name ?? `#${asset.item_id}`}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{asset.serial_number || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {asset.current_location ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {asset.current_location.name}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {asset.current_holder ? (
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {asset.current_holder.name}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      STATUS_STYLE[asset.status] ?? 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {asset.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/assets/${encodeURIComponent(asset.asset_tag)}/edit`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
