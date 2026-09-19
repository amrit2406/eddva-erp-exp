import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import SessionStatusBadge from '../../components/sessions/SessionStatusBadge';
import { deleteSession, getSessions } from '../../api/admission.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import { SESSION_STATUSES, type AdmissionSession, type Pagination, type SessionStatus } from '../../types/admission.types';

const PAGE_SIZE = 10;

export default function SessionsPage() {
  const { toast } = useToast();
  const { can, isViewOnlyAdmin, ready } = useResourceAccess('sessions');
  const [sessions, setSessions] = useState<AdmissionSession[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<SessionStatus | ''>('');
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
    getSessions({ page, limit: PAGE_SIZE, search: debouncedSearch, status })
      .then((result) => {
        if (cancelled) return;
        setSessions(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load academic sessions'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, status, reloadKey]);

  const handleDelete = useCallback(
    async (session: AdmissionSession) => {
      if (!window.confirm(`Delete academic session "${session.name}"?`)) return;
      try {
        await deleteSession(session.session_id);
        toast.success('Academic session deleted');
        if (sessions.length === 1 && page > 1) setPage(page - 1);
        else setReloadKey((key) => key + 1);
      } catch (err: any) {
        if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete session'));
      }
    },
    [page, sessions.length, toast]
  );

  const showActions = can('update') || can('delete');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Sessions</h1>
          <p className="text-slate-600 mt-1">Admission cycles applications are collected against</p>
        </div>
        {can('create') && (
          <Link to="/admission/sessions/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice isViewOnlyAdmin={isViewOnlyAdmin} />}

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as SessionStatus | '');
              setPage(1);
            }}
            className="px-3 py-2 border border-slate-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
          >
            <option value="">All statuses</option>
            {SESSION_STATUSES.map((s) => (
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Session</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Start</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">End</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    {showActions && <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={showActions ? 5 : 4} className="text-center py-8 text-slate-500">
                        No academic sessions found
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr key={session.session_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">{session.name}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(session.start_date)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(session.end_date)}</td>
                        <td className="py-3 px-4">
                          <SessionStatusBadge status={session.status} />
                        </td>
                        {showActions && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {can('update') && (
                                <Link to={`/admission/sessions/${session.session_id}/edit`}>
                                  <Button variant="ghost" size="sm" title="Edit">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {can('delete') && (
                                <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(session)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              )}
                            </div>
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
