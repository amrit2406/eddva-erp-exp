import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Search, User } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import { getApplicants } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { getApiErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import type { Applicant, Pagination } from '../../types/admission.types';

const PAGE_SIZE = 10;

function ApplicantAvatar({ applicant }: { applicant: Applicant }) {
  const [failed, setFailed] = useState(false);

  if (applicant.photo_url && !failed) {
    return (
      <img
        src={applicant.photo_url}
        alt=""
        onError={() => setFailed(true)}
        className="h-9 w-9 rounded-full border border-slate-200 object-cover"
      />
    );
  }
  return (
    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
      <User className="h-4 w-4" />
    </div>
  );
}

export default function ApplicantsPage() {
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('applicants');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
    getApplicants({ page, limit: PAGE_SIZE, search: debouncedSearch })
      .then((result) => {
        if (cancelled) return;
        setApplicants(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load applicants'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  const showActions = can('update');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
          <p className="text-slate-600 mt-1">Students and families applying for admission</p>
        </div>
        {can('create') && (
          <Link to="/admission/applicants/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Applicant
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Date of Birth</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Gender</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Guardian</th>
                    {showActions && <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {applicants.length === 0 ? (
                    <tr>
                      <td colSpan={showActions ? 6 : 5} className="text-center py-8 text-slate-500">
                        No applicants found
                      </td>
                    </tr>
                  ) : (
                    applicants.map((applicant) => (
                      <tr key={applicant.applicant_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <ApplicantAvatar applicant={applicant} />
                            <span className="font-medium text-slate-900">{applicant.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(applicant.dob)}</td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{applicant.gender}</td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{applicant.email || '—'}</div>
                          <div className="text-xs text-slate-500">{applicant.phone || '—'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div>{applicant.guardian_name || '—'}</div>
                          <div className="text-xs text-slate-500">{applicant.guardian_contact || '—'}</div>
                        </td>
                        {showActions && (
                          <td className="py-3 px-4 text-right">
                            <Link to={`/admission/applicants/${applicant.applicant_id}/edit`}>
                              <Button variant="ghost" size="sm" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        )}
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
