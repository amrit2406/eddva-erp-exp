import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Pencil, Plus, Search, Shield, Trash2, Users, X } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import IconAction from '../../../../components/premium/list/IconAction';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import Pagination from '../../../../components/premium/list/Pagination';
import { useToast } from '../../../../hooks/useToast';
import InstituteAdminGuard from '../../components/rbac/InstituteAdminGuard';
import { deleteRole, getPermissionsCatalog, getRoles } from '../../api/library.api';
import type { Role } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { useCanManageAccess } from '../../utils/rbac.utils';

const PAGE_SIZE = 10;
const AREA_CHIPS = 3;

const countPermissions = (role: Role) => role.permissions.reduce((sum, p) => sum + p.actions.length, 0);

export default function RolesPage() {
  const isAdmin = useCanManageAccess();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

  const { data: roles = [], isLoading, error, refetch } = useQuery({ queryKey: ['library', 'roles'], queryFn: getRoles, enabled: isAdmin });
  // Only used to show area names instead of codes.
  const { data: catalog } = useQuery({ queryKey: ['library', 'permissions-catalog'], queryFn: getPermissionsCatalog, enabled: isAdmin });
  const areaName = useMemo(() => new Map((catalog?.resources ?? []).map((r) => [r.resource, r.name])), [catalog]);

  const remove = useMutation({
    mutationFn: (role: Role) => deleteRole(role.role_id),
    onSuccess: (_, role) => {
      queryClient.setQueryData<Role[]>(['library', 'roles'], (current) => current?.filter((r) => r.role_id !== role.role_id));
      toast.success(`Role “${role.name}” deleted`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not delete this role')),
    onSettled: () => setPendingDelete(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => [r.name, r.description].some((v) => v?.toLowerCase().includes(q)));
  }, [roles, search]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));

  const header = (
    <ListHeader
      icon={Shield}
      title="Roles"
      description="A role is a set of permissions. Give a role to a person to decide what they can do."
      actions={
        isAdmin && (
          <>
            <Link to="/library/permissions" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
              <KeyRound className="h-4 w-4" /> Permissions
            </Link>
            <Link
              to="/library/roles/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-navy to-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> New role
            </Link>
          </>
        )
      }
    />
  );

  if (!isAdmin) {
    return (
      <div className="space-y-5">
        {header}
        <InstituteAdminGuard section="Roles" />
      </div>
    );
  }
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load roles')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      {header}

      {isLoading ? (
        <ListSkeleton />
      ) : roles.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No roles yet"
          message="Create a role like “Librarian” or “Library Assistant”, choose what it can do, then give it to people."
          action={
            <Link to="/library/roles/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-navy to-brand px-4 py-2.5 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> New role
            </Link>
          }
        />
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
                placeholder="Search roles"
                aria-label="Search roles"
                className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-10 text-sm shadow-soft ring-1 ring-slate-200/70 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} role{filtered.length === 1 ? '' : 's'}
            </p>
          </div>

          {filtered.length === 0 ? (
            <NoResults onClear={() => setSearch('')} />
          ) : (
            <div className="animate-rise overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3 pl-5 pr-3">Role</th>
                      <th className="px-3 py-3">Can work in</th>
                      <th className="px-3 py-3">People</th>
                      <th className="py-3 pl-3 pr-5">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((role) => {
                      const areas = role.permissions.filter((p) => p.actions.length > 0);
                      const people = role._count?.user_roles ?? 0;
                      return (
                        <tr key={role.role_id} className="transition-colors hover:bg-slate-50/80">
                          <td className="py-3.5 pl-5 pr-3">
                            <Link to={`/library/roles/${role.role_id}/edit`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                              {role.name}
                            </Link>
                            <p className="max-w-xs truncate text-xs text-slate-500">{role.description}</p>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {areas.slice(0, AREA_CHIPS).map((p) => (
                                <span key={p.resource} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                  {areaName.get(p.resource) ?? p.resource}
                                </span>
                              ))}
                              {areas.length > AREA_CHIPS && <span className="text-xs text-slate-500">+{areas.length - AREA_CHIPS} more</span>}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">{countPermissions(role)} permissions</p>
                          </td>
                          <td className="px-3 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-slate-700">
                              <Users className="h-3.5 w-3.5 text-slate-400" /> {people}
                            </span>
                          </td>
                          <td className="py-3.5 pl-3 pr-5">
                            <div className="flex items-center justify-end gap-0.5">
                              <IconAction icon={Pencil} label="Edit role" to={`/library/roles/${role.role_id}/edit`} />
                              <IconAction icon={Trash2} label="Delete role" tone="danger" onClick={() => setPendingDelete(role)} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} noun="roles" />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        onClose={() => !remove.isPending && setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        title="Delete this role?"
        message={
          pendingDelete
            ? (pendingDelete._count?.user_roles ?? 0) > 0
              ? `${pendingDelete._count?.user_roles} ${(pendingDelete._count?.user_roles ?? 0) === 1 ? 'person has' : 'people have'} “${pendingDelete.name}”. They'll lose what this role lets them do. This can't be undone.`
              : `“${pendingDelete.name}” will be removed. Nobody has it right now. This can't be undone.`
            : ''
        }
        confirmText={remove.isPending ? 'Deleting…' : 'Delete role'}
      />
    </div>
  );
}
