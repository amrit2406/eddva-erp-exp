import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import EnquiryTable from '../../components/enquiries/EnquiryTable';
import EnquiryFilters from '../../components/enquiries/EnquiryFilters';
import { getEnquiries } from '../../api/enquiries.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';
import type { FrontOfficeEnquiry, EnquiryPagination, FrontOfficeEnquirySource, FrontOfficeEnquiryStatus } from '../../types/enquiryRecord.types';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<FrontOfficeEnquiry[]>([]);
  const [pagination, setPagination] = useState<EnquiryPagination | null>(null);
  const [filters, setFilters] = useState<{
    search: string;
    source: FrontOfficeEnquirySource | '';
    status: FrontOfficeEnquiryStatus | '';
    category: string;
  }>({ search: '', source: '', status: '', category: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [filters, page]);

  async function load() {
    try {
      setLoading(true);
      const result = await getEnquiries({
        search: filters.search || undefined,
        source: filters.source || undefined,
        status: filters.status || undefined,
        category: filters.category || undefined,
        page,
        limit: 25,
      });
      setEnquiries(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      if (err.response?.status === 401) {
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load enquiries'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enquiry Register</h1>
          <p className="text-slate-600 mt-1">Track and follow up on enquiries</p>
        </div>
        <div className="flex gap-2">
          <Link to="/front-office/enquiries/followups">
            <Button variant="secondary">
              <Clock className="h-4 w-4 mr-2" />
              Follow-ups
            </Button>
          </Link>
          <Link to="/front-office/enquiries/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              New Enquiry
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          <EnquiryFilters value={filters} onChange={setFilters} />
          <div className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <>
                <EnquiryTable enquiries={enquiries} />
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 text-sm text-slate-600">
                    <span>
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} enquiries)
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
