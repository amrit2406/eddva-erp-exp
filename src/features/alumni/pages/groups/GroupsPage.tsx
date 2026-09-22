import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import { deleteGroup, getGroups } from '../../api/groups.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { Pagination } from '../../types/profile.types';
import type { AlumniGroup } from '../../types/engagement.types';

const PAGE_SIZE = 20;

export default function GroupsPage() {
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('groups');
  const [groups, setGroups] = useState<AlumniGroup[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getGroups({ page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setGroups(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setError(getApiErrorMessage(err, 'Failed to load groups'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  const handleDelete = useCallback(
    async (group: AlumniGroup) => {
      if (!window.confirm(`Delete group "${group.name}"?`)) return;
      try {
        await deleteGroup(group.group_id);
        toast.success('Group deleted');
        if (groups.length === 1 && page > 1) setPage(page - 1);
        else setReloadKey((key) => key + 1);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to delete group'));
      }
    },
    [page, groups.length, toast]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alumni Groups</h1>
          <p className="text-slate-600 mt-1">Batches, chapters and other alumni groupings</p>
        </div>
        {can('create') && (
          <Link to="/alumni/groups/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Group</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Members</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">
                        No groups found
                      </td>
                    </tr>
                  ) : (
                    groups.map((group) => (
                      <tr key={group.group_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link to={`/alumni/groups/${group.group_id}`} className="font-medium text-slate-900 hover:text-blue-600">
                            {group.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-slate-600 capitalize">{group.group_type}</td>
                        <td className="py-3 px-4 text-slate-600 hidden md:table-cell max-w-xs truncate">
                          {group.description || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-slate-400" />
                            {group.member_count ?? '—'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {can('update') && (
                              <Link to={`/alumni/groups/${group.group_id}/edit`}>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {(can('delete') || can('update')) && (
                              <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(group)}>
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
