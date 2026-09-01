import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import StockTabs from '../../components/stock/StockTabs';
import BalanceTable from '../../components/stock/BalanceTable';
import { getBalances, reconcileStock } from '../../api/stock.api';
import { getItems } from '../../api/items.api';
import { getLocations } from '../../api/locations.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { InventoryStockBalance, StockPagination } from '../../types/stock.types';
import type { InventoryItem } from '../../types/item.types';
import type { InventoryLocation } from '../../types/location.types';

export default function BalancesPage() {
  const [balances, setBalances] = useState<InventoryStockBalance[]>([]);
  const [pagination, setPagination] = useState<StockPagination | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [itemId, setItemId] = useState<number | ''>('');
  const [locationId, setLocationId] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reconciling, setReconciling] = useState(false);
  const [reconcileMessage, setReconcileMessage] = useState<string | null>(null);

  useEffect(() => {
    getItems({ limit: 100 }).then((r) => setItems(r.data)).catch(() => setItems([]));
    getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [itemId, locationId]);

  useEffect(() => {
    loadBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, locationId, page]);

  async function loadBalances() {
    try {
      setLoading(true);
      const result = await getBalances({
        item_id: itemId || undefined,
        location_id: locationId || undefined,
        page,
        limit: 50,
      });
      setBalances(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load stock balances'));
    } finally {
      setLoading(false);
    }
  }

  async function handleReconcile() {
    const scopeLabel = itemId ? items.find((i) => i.item_id === itemId)?.name ?? 'this item' : 'all items';
    if (!window.confirm(`Recompute stock balances for ${scopeLabel} from the ledger?`)) return;
    try {
      setReconciling(true);
      setReconcileMessage(null);
      const result = await reconcileStock(itemId || undefined);
      setReconcileMessage(`Reconciled ${result.reconciled_rows} row(s).`);
      await loadBalances();
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to reconcile stock'));
    } finally {
      setReconciling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Register</h1>
          <p className="text-slate-600 mt-1">Track purchases, transfers, adjustments, and stock levels</p>
        </div>
        <Button variant="secondary" onClick={handleReconcile} disabled={reconciling}>
          <RefreshCw className={`h-4 w-4 mr-2 ${reconciling ? 'animate-spin' : ''}`} />
          {reconciling ? 'Reconciling...' : 'Reconcile'}
        </Button>
      </div>

      <StockTabs />

      {reconcileMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {reconcileMessage}
        </div>
      )}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
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
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <BalanceTable balances={balances} />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 text-sm text-slate-600">
                <span>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} balances)
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
