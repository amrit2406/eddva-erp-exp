import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import PaginationBar from '../../components/common/PaginationBar';
import DataTable from '../../components/reports/DataTable';
import { getNotifications } from '../../api/admission.api';
import { getApiErrorMessage } from '../../utils/errors';
import type { Pagination } from '../../types/admission.types';

const PAGE_SIZE = 20;

// Columns that identify the institute or the row rather than describe the message.
const HIDDEN_COLUMNS = ['institute_id'];

interface LogResult {
  key: string;
  rows?: Record<string, unknown>[];
  pagination?: Pagination;
  error?: string;
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [result, setResult] = useState<LogResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // While the stored result belongs to a different page/search it is loading, so
  // stale rows never show under new filters.
  const key = `${page}|${debouncedSearch}`;
  const loading = result?.key !== key;

  useEffect(() => {
    let cancelled = false;
    getNotifications({ page, limit: PAGE_SIZE, search: debouncedSearch })
      .then((res) => {
        if (!cancelled) setResult({ key, rows: res.data, pagination: res.pagination });
      })
      .catch((err) => {
        if (!cancelled) setResult({ key, error: getApiErrorMessage(err, 'Failed to load the notification log') });
      });
    return () => {
      cancelled = true;
    };
  }, [key, page, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notification Log</h1>
        <p className="text-slate-600 mt-1">Messages the admission system has sent, and whether they went through</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : result?.error ? (
          <div className="p-8 text-center text-red-500">{result.error}</div>
        ) : result?.rows && result.rows.length > 0 ? (
          <>
            <div className="p-4">
              <DataTable rows={result.rows} showTime hideColumns={HIDDEN_COLUMNS} />
            </div>
            {result.pagination && <PaginationBar pagination={result.pagination} onPageChange={setPage} />}
          </>
        ) : (
          <div className="p-8 text-center text-slate-500">No notifications found</div>
        )}
      </Card>
    </div>
  );
}
