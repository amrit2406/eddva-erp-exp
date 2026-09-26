import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Plus, Search, Users, X } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import Pagination from '../../../../components/premium/list/Pagination';
import { useToast } from '../../../../hooks/useToast';
import PermissionAreaList, { type PermissionArea } from '../../components/rbac/PermissionAreaList';
import { deletePermission, getPermissions } from '../../api/roles.api';
import type { Permission } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';
import { actionInfo, actionRank } from '../../utils/permissionLabels';

const PAGE_SIZE = 10;

function groupByArea(permissions: Permission[]): PermissionArea[] {
  const map = new Map<string, Permission[]>();
  permissions.forEach((p) => {
    const name = p.category || p.resource;
    map.set(name, [...(map.get(name) ?? []), p]);
  });
  return [...map.entries()]
    .map(([name, list]) => ({
      name,
      description: list.find((p) => p.description)?.description ?? '',
      permissions: [...list].sort((a, b) => actionRank(a.action) - actionRank(b.action)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function PermissionsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Permission | null>(null);

  const { data: permissions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sales-purchase', 'permissions'],
    queryFn: getPermissions,
  });

  const remove = useMutation({
    mutationFn: (p: Permission) => deletePermission(p.permission_id),
    onSuccess: (_, p) => {
      queryClient.setQueryData<Permission[]>(['sales-purchase', 'permissions'], (current) => current?.filter((x) => x.permission_id !== p.permission_id));
      toast.success(`${p.category}: “${actionInfo(p.action).label}” permission deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this permission')),
    onSettled: () => setPendingDelete(null),
  });

  const areas = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matching = q
      ? permissions.filter((p) =>
          [p.category, p.resource, p.key, p.description, p.action, actionInfo(p.action).label].some((v) => v?.toLowerCase().includes(q)),
        )
      : permissions;
    return groupByArea(matching);
  }, [permissions, search]);

  const matchCount = areas.reduce((sum, a) => sum + a.permissions.length, 0);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(areas.length / PAGE_SIZE)));

  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load permissions')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <ListHeader
        icon={KeyRound}
        title="Permissions"
        description="What people are allowed to do in Sales & Purchase. Give them to people through roles."
        actions={
          <>
            <Link
              to="/sales-purchase/roles"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              <Users className="h-4 w-4" /> Roles
            </Link>
            <Link
              to="/sales-purchase/permissions/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-navy to-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> New permission
            </Link>
          </>
        }
      />

      {isLoading ? (
        <ListSkeleton />
      ) : permissions.length === 0 ? (
        <EmptyState icon={KeyRound} title="No permissions yet" message="Permissions decide what each role can see and do in Sales & Purchase." />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by area or action, e.g. “purchase orders” or “approve”"
                aria-label="Search permissions"
                className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-soft ring-1 ring-slate-200/70 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="whitespace-nowrap text-xs text-slate-500">
              {matchCount} permission{matchCount === 1 ? '' : 's'} in {areas.length} area{areas.length === 1 ? '' : 's'}
            </p>
          </div>

          {areas.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <div className="animate-rise overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70">
              <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_auto] gap-3 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid">
                <span>Area</span>
                <span>What can be allowed</span>
                <span className="w-4" />
              </div>
              <PermissionAreaList areas={areas.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)} onDelete={setPendingDelete} />
              <Pagination page={currentPage} pageSize={PAGE_SIZE} total={areas.length} onPage={setPage} noun="areas" />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Delete this permission?"
        message={
          pendingDelete
            ? `“${actionInfo(pendingDelete.action).label}” on ${pendingDelete.category} will be removed from every role that has it${
                pendingDelete.is_system ? '. It is a built-in permission, so the app may rely on it' : ''
              }. This can't be undone.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete permission'}
      />
    </div>
  );
}
