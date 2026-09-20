import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import EnquiryStatusBadge from '../../components/enquiries/EnquiryStatusBadge';
import { deleteEnquiry, getEnquiries } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatDate, formatLabel } from '../../utils/format';
import {
  ENQUIRY_SOURCES,
  ENQUIRY_STATUSES,
  type Enquiry,
  type EnquirySource,
  type EnquiryStatus,
  type Pagination,
} from '../../types/admission.types';

const PAGE_SIZE = 10;

const selectClass =
  'px-3 py-2 border border-slate-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function EnquiriesPage() {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('enquiries');
  const { nameOf } = useProgramOptions();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<EnquiryStatus | ''>('');
  const [source, setSource] = useState<EnquirySource | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEnquiries({ page, limit: PAGE_SIZE, search: debouncedSearch, status, source })
      .then((result) => {
        if (cancelled) return;
        setEnquiries(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load enquiries'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, status, source, reloadKey]);

  const handleDelete = useCallback(
    async (enquiry: Enquiry) => {
      if (!window.confirm(`Delete the enquiry from "${enquiry.name}"? Its follow-ups will be lost too.`)) return;
      try {
        await deleteEnquiry(enquiry.enquiry_id);
        toast.success('Enquiry deleted');
        if (enquiries.length === 1 && page > 1) setPage(page - 1);
        else setReloadKey((key) => key + 1);
      } catch (err: any) {
        if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete enquiry'));
      }
    },
    [enquiries.length, page, toast]
  );

  const columnCount = 6;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Enquiries & Leads</h1>
          <p className="text-slate-600 mt-1">Track prospective families from first contact to application</p>
        </div>
        {can('create') && (
          <Link to="/admission/enquiries/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Enquiry
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search enquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as EnquiryStatus | '');
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All statuses</option>
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>{formatLabel(s)}</option>
            ))}
          </select>
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value as EnquirySource | '');
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All sources</option>
            {ENQUIRY_SOURCES.map((s) => (
              <option key={s} value={s}>{formatLabel(s)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Enquirer</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Program</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Source</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Received</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.length === 0 ? (
                    <tr>
                      <td colSpan={columnCount} className="text-center py-8 text-slate-500">
                        No enquiries found
                      </td>
                    </tr>
                  ) : (
                    enquiries.map((enquiry) => (
                      <tr key={enquiry.enquiry_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            to={`/admission/enquiries/${enquiry.enquiry_id}`}
                            className="font-medium text-slate-900 hover:text-[#008BE9]"
                          >
                            {enquiry.name}
                          </Link>
                          <div className="text-xs text-slate-500">{enquiry.phone || enquiry.email || '—'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {enquiry.program?.name ??
                            nameOf(enquiry.program_id) ??
                            (enquiry.program_id ? `Program #${enquiry.program_id}` : '—')}
                        </td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{formatLabel(enquiry.source)}</td>
                        <td className="py-3 px-4">
                          <EnquiryStatusBadge status={enquiry.status} />
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(enquiry.created_at)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admission/enquiries/${enquiry.enquiry_id}`}>
                              <Button variant="ghost" size="sm" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {can('update') && (
                              <Link to={`/admission/enquiries/${enquiry.enquiry_id}/edit`}>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {can('delete') && (
                              <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(enquiry)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
          </>
        )}
      </Card>
    </div>
  );
}
