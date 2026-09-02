import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Input from '../../../../components/ui/Input';
import Select from '../../../../components/ui/Select';
import HolderTable from '../../components/holders/HolderTable';
import { getHolders } from '../../api/holders.api';
import { getApiErrorMessage } from '../../utils/errors';
import { HOLDER_TYPE_OPTIONS } from '../../constants/holder.constants';
import type { InventoryHolder, InventoryHolderPagination, InventoryHolderType } from '../../types/holder.types';

export default function HoldersPage() {
  const [holders, setHolders] = useState<InventoryHolder[]>([]);
  const [pagination, setPagination] = useState<InventoryHolderPagination | null>(null);
  const [search, setSearch] = useState('');
  const [holderType, setHolderType] = useState<InventoryHolderType | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, holderType]);

  useEffect(() => {
    const timeout = setTimeout(loadHolders, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, holderType, page]);

  async function loadHolders() {
    try {
      setLoading(true);
      const result = await getHolders({
        search: search || undefined,
        holder_type: holderType || undefined,
        page,
        limit: 25,
      });
      setHolders(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load holders'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Holders</h1>
          <p className="text-slate-600 mt-1">Manage staff, students, and departments that hold inventory items</p>
        </div>
        <Link to="/inventory/holders/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Holder
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search holders by name..."
            className="flex-1"
          />
          <Select
            value={holderType}
            onChange={(e) => setHolderType(e.target.value as InventoryHolderType | '')}
            placeholder="All Types"
            options={HOLDER_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            className="w-full sm:w-44"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <HolderTable holders={holders} />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 text-sm text-slate-600">
                <span>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} holders)
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
