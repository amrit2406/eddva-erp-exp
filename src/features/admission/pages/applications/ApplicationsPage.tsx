import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import { deleteApplication, getApplications } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatDate, formatLabel } from '../../utils/format';
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationStatus,
  type Pagination,
} from '../../types/admission.types';

const PAGE_SIZE = 10;

const selectClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function ApplicationsPage() {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('applications');
  const { programs, status: programsStatus, nameOf: programName } = useProgramOptions();
  const { sessions, status: sessionsStatus, nameOf: sessionName } = useSessionOptions();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | ''>('');
  const [sessionId, setSessionId] = useState<number | ''>('');
  const [programId, setProgramId] = useState<number | ''>('');
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
    getApplications({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch,
      status,
      session_id: sessionId,
      program_id: programId,
    })
      .then((result) => {
        if (cancelled) return;
        setApplications(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load applications'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, status, sessionId, programId, reloadKey]);

  const handleDelete = useCallback(
    async (application: Application) => {
      const who = application.applicant?.name ?? `applicant #${application.applicant_id}`;
      if (!window.confirm(`Delete the application for ${who}?`)) return;
      try {
        await deleteApplication(application.application_id);
        toast.success('Application deleted');
        if (applications.length === 1 && page > 1) setPage(page - 1);
        else setReloadKey((key) => key + 1);
      } catch (err: any) {
        if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete application'));
      }
    },
    [applications.length, page, toast]
  );

  const toId = (value: string): number | '' => (value === '' ? '' : Number(value));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-600 mt-1">Admission applications and where each one stands</p>
        </div>
        {can('create') && (
          <Link to="/admission/applications/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              New Application
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
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ApplicationStatus | '');
              setPage(1);
            }}
            className={`${selectClass} capitalize`}
          >
            <option value="">All statuses</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>{formatLabel(s)}</option>
            ))}
          </select>
          {sessionsStatus === 'ready' && (
            <select
              value={sessionId}
              onChange={(e) => {
                setSessionId(toId(e.target.value));
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">All sessions</option>
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>{s.name}</option>
              ))}
            </select>
          )}
          {programsStatus === 'ready' && (
            <select
              value={programId}
              onChange={(e) => {
                setProgramId(toId(e.target.value));
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">All programs</option>
              {programs.map((p) => (
                <option key={p.program_id} value={p.program_id}>{p.name}</option>
              ))}
            </select>
          )}
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Session</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Applied</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        No applications found
                      </td>
                    </tr>
                  ) : (
                    applications.map((application) => (
                      <tr key={application.application_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            to={`/admission/applications/${application.application_id}`}
                            className="font-medium text-slate-900 hover:text-[#008BE9]"
                          >
                            {application.applicant?.name ?? `Applicant #${application.applicant_id}`}
                          </Link>
                          <div className="text-xs text-slate-500">Application #{application.application_id}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {application.program?.name ?? programName(application.program_id) ?? `Program #${application.program_id}`}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {application.session?.name ?? sessionName(application.session_id) ?? `Session #${application.session_id}`}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(application.application_date)}</td>
                        <td className="py-3 px-4">
                          <ApplicationStatusBadge status={application.status} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admission/applications/${application.application_id}`}>
                              <Button variant="ghost" size="sm" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {can('update') && (
                              <Link to={`/admission/applications/${application.application_id}/edit`}>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {can('delete') && (
                              <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(application)}>
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
