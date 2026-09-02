import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Select from '../../../../components/ui/Select';
import MaintenanceTable from '../../components/maintenance/MaintenanceTable';
import { getMaintenanceRecords } from '../../api/maintenance.api';
import { getApiErrorMessage } from '../../utils/errors';
import { MAINTENANCE_STATUS_OPTIONS } from '../../constants/maintenance.constants';
import type { InventoryMaintenance, InventoryMaintenancePagination, InventoryMaintenanceStatus } from '../../types/maintenance.types';

export default function MaintenancePage() {
  const [records, setRecords] = useState<InventoryMaintenance[]>([]);
  const [pagination, setPagination] = useState<InventoryMaintenancePagination | null>(null);
  const [status, setStatus] = useState<InventoryMaintenanceStatus | ''>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [status]);

  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  async function loadRecords() {
    try {
      setLoading(true);
      const result = await getMaintenanceRecords({ status: status || undefined, page, limit: 25 });
      setRecords(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load maintenance records'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Asset Maintenance</h1>
          <p className="text-slate-600 mt-1">Track reported issues and repairs for asset units</p>
        </div>
        <Link to="/inventory/maintenance/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Report Issue
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as InventoryMaintenanceStatus | '')}
            placeholder="All Statuses"
            options={MAINTENANCE_STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
            className="w-full sm:w-48"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <MaintenanceTable records={records} />
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-200 text-sm text-slate-600">
                <span>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
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
