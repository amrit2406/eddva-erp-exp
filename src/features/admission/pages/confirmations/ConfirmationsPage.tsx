import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import PaginationBar from '../../components/common/PaginationBar';
import ConfirmationStatusBadge from '../../components/confirmations/ConfirmationStatusBadge';
import { getConfirmations } from '../../api/admission.api';
import { getApiErrorMessage } from '../../utils/errors';
import { confirmationApplicantName } from '../../utils/confirmations';
import { formatDate } from '../../utils/format';
import {
  CONFIRMATION_STATUSES,
  type Confirmation,
  type ConfirmationStatus,
  type Pagination,
} from '../../types/admission.types';

const PAGE_SIZE = 10;

export default function ConfirmationsPage() {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<ConfirmationStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    getConfirmations({ page, limit: PAGE_SIZE, search: debouncedSearch, status })
      .then((result) => {
        if (cancelled) return;
        setConfirmations(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load confirmations'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Confirmations</h1>
        <p className="text-slate-600 mt-1">
          Confirmed admissions and their student records. Confirm an admission from the application's page.
        </p>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search confirmations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ConfirmationStatus | '');
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          >
            <option value="">All statuses</option>
            {CONFIRMATION_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Applicant</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Program</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Confirmed</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Student Record</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {confirmations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        No confirmations found
                      </td>
                    </tr>
                  ) : (
                    confirmations.map((confirmation) => (
                      <tr key={confirmation.confirmation_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            to={`/admission/confirmations/${confirmation.confirmation_id}`}
                            className="font-medium text-slate-900 hover:text-[#008BE9]"
                          >
                            {confirmationApplicantName(confirmation)}
                          </Link>
                          <div className="text-xs text-slate-500">Application #{confirmation.application_id}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{confirmation.application?.program?.name ?? '—'}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {formatDate(confirmation.confirmed_at ?? confirmation.created_at)}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {confirmation.student_ref ?? <span className="text-slate-400">Not linked</span>}
                        </td>
                        <td className="py-3 px-4">
                          <ConfirmationStatusBadge status={confirmation.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link to={`/admission/confirmations/${confirmation.confirmation_id}`}>
                            <Button variant="ghost" size="sm" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
