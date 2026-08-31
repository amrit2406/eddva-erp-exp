import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import ComplaintTable from '../../components/complaints/ComplaintTable';
import ComplaintFilters from '../../components/complaints/ComplaintFilters';
import { getComplaints } from '../../api/complaints.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeComplaint, ComplaintPagination, FrontOfficeComplaintPriority, FrontOfficeComplaintStatus } from '../../types/complaintRecord.types';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<FrontOfficeComplaint[]>([]);
  const [pagination, setPagination] = useState<ComplaintPagination | null>(null);
  const [filters, setFilters] = useState<{
    search: string;
    category: string;
    priority: FrontOfficeComplaintPriority | '';
    status: FrontOfficeComplaintStatus | '';
  }>({ search: '', category: '', priority: '', status: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  async function load() {
    try {
      setLoading(true);
      const result = await getComplaints({
        search: filters.search || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        status: filters.status || undefined,
        page,
        limit: 25,
      });
      setComplaints(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load complaints'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Register</h1>
          <p className="text-slate-600 mt-1">Manage complaints and resolutions</p>
        </div>
        <Link to="/front-office/complaints/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            New Complaint
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <ComplaintFilters value={filters} onChange={setFilters} />
          <div className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <>
                <ComplaintTable complaints={complaints} />
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 text-sm text-slate-600">
                    <span>
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} complaints)
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
