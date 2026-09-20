import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Search, Eye } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import { MeritStatusBadge } from '../../components/meritLists/MeritBadges';
import { getMeritLists } from '../../api/admission.api';
import { useProgramOptions } from '../../hooks/useProgramOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useSessionOptions } from '../../hooks/useSessionOptions';
import { getApiErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import { MERIT_LISTS_RESOURCE, entryCount, isPublished } from '../../utils/meritLists';
import type { MeritList, MeritListStatus, Pagination } from '../../types/admission.types';

const PAGE_SIZE = 10;

const selectClass =
  'px-3 py-2 border border-slate-300 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function MeritListsPage() {
  const { can, isViewOnlyAdmin, ready } = useResourceAccess(MERIT_LISTS_RESOURCE);
  const { programs, status: programsStatus, nameOf: programName } = useProgramOptions();
  const { sessions, status: sessionsStatus, nameOf: sessionName } = useSessionOptions();
  const [lists, setLists] = useState<MeritList[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sessionId, setSessionId] = useState<number | ''>('');
  const [programId, setProgramId] = useState<number | ''>('');
  const [status, setStatus] = useState<MeritListStatus | ''>('');
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
    getMeritLists({ page, limit: PAGE_SIZE, search: debouncedSearch, session_id: sessionId, program_id: programId, status })
      .then((result) => {
        if (cancelled) return;
        setLists(result.data);
        setPagination(result.pagination);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err, 'Failed to load merit lists'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, sessionId, programId, status]);

  const toId = (value: string): number | '' => (value === '' ? '' : Number(value));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Merit Lists</h1>
          <p className="text-slate-600 mt-1">Rank applications and publish admission outcomes</p>
        </div>
        {can('create') && (
          <Link to="/admission/merit-lists/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              New Merit List
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
              placeholder="Search merit lists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
            />
          </div>
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
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as MeritListStatus | '');
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Merit List</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Program</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Entries</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lists.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        No merit lists found
                      </td>
                    </tr>
                  ) : (
                    lists.map((list) => {
                      const published = isPublished(list);
                      const count = entryCount(list);
                      return (
                        <tr key={list.merit_list_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <Link
                              to={`/admission/merit-lists/${list.merit_list_id}`}
                              className="font-medium text-slate-900 hover:text-[#008BE9]"
                            >
                              {list.name}
                            </Link>
                            <div className="text-xs text-slate-500">
                              {list.session?.name ?? sessionName(list.session_id) ?? `Session #${list.session_id}`}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {list.program?.name ?? programName(list.program_id) ?? `Program #${list.program_id}`}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">{count ?? '—'}</td>
                          <td className="py-3 px-4">
                            <MeritStatusBadge published={published} />
                          </td>
                          <td className="py-3 px-4 text-slate-600">{formatDate(list.created_at)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/admission/merit-lists/${list.merit_list_id}`}>
                                <Button variant="ghost" size="sm" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {can('update') && !published && (
                                <Link to={`/admission/merit-lists/${list.merit_list_id}/edit`}>
                                  <Button variant="ghost" size="sm" title="Edit">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
