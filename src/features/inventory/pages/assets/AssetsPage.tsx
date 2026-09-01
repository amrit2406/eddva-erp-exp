import { useState, useEffect } from 'react';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import Button from '../../../../components/ui/Button';
import AssetTable from '../../components/assets/AssetTable';
import { getAssets } from '../../api/assets.api';
import { getItems } from '../../api/items.api';
import { getLocations } from '../../api/locations.api';
import { getApiErrorMessage } from '../../utils/errors';
import { ASSET_STATUS_OPTIONS } from '../../constants/asset.constants';
import type { InventoryAsset, InventoryAssetPagination, InventoryAssetStatus } from '../../types/asset.types';
import type { InventoryItem } from '../../types/item.types';
import type { InventoryLocation } from '../../types/location.types';

export default function AssetsPage() {
  const [assets, setAssets] = useState<InventoryAsset[]>([]);
  const [pagination, setPagination] = useState<InventoryAssetPagination | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [search, setSearch] = useState('');
  const [itemId, setItemId] = useState<number | ''>('');
  const [locationId, setLocationId] = useState<number | ''>('');
  const [status, setStatus] = useState<InventoryAssetStatus | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getItems({ limit: 100, item_type: 'asset' }).then((r) => setItems(r.data)).catch(() => setItems([]));
    getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, itemId, locationId, status]);

  useEffect(() => {
    const timeout = setTimeout(loadAssets, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, itemId, locationId, status, page]);

  async function loadAssets() {
    try {
      setLoading(true);
      const result = await getAssets({
        search: search || undefined,
        item_id: itemId || undefined,
        location_id: locationId || undefined,
        status: status || undefined,
        page,
        limit: 25,
      });
      setAssets(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load assets'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
        <p className="text-slate-600 mt-1">Track individually tagged asset units</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by asset tag or serial number..."
            className="flex-1"
          />
          <Select
            value={itemId}
            onChange={(e) => setItemId(e.target.value ? Number(e.target.value) : '')}
            placeholder="All Items"
            options={items.map((i) => ({ value: String(i.item_id), label: i.name }))}
            className="w-full sm:w-48"
          />
          <Select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : '')}
            placeholder="All Locations"
            options={locations.map((l) => ({ value: String(l.location_id), label: l.name }))}
            className="w-full sm:w-48"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as InventoryAssetStatus | '')}
            placeholder="All Statuses"
            options={ASSET_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            className="w-full sm:w-44"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <AssetTable assets={assets} />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 text-sm text-slate-600">
                <span>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} assets)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
