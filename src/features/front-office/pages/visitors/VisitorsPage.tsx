import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import VisitorTable from '../../components/visitors/VisitorTable';
import VisitorFilters from '../../components/visitors/VisitorFilters';
import { getVisitors } from '../../api/visitors.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeVisitor, VisitorPagination } from '../../types/visitorRecord.types';

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<FrontOfficeVisitor[]>([]);
  const [pagination, setPagination] = useState<VisitorPagination | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [search, page]);

  async function load() {
    try {
      setLoading(true);
      const result = await getVisitors({ search: search || undefined, page, limit: 25 });
      setVisitors(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load visitors'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitor Register</h1>
          <p className="text-slate-600 mt-1">Manage visitor master records</p>
        </div>
        <Link to="/front-office/visitors/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Register Visitor
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <VisitorFilters value={search} onChange={setSearch} />
          <div className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <>
                <VisitorTable visitors={visitors} />
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 text-sm text-slate-600">
                    <span>
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} visitors)
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        Previous
                      </Button>
                      <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
