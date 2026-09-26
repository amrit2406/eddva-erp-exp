import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, KeyRound, Search, Shield, UserPlus, Users, UserX, X } from 'lucide-react';
import ConfirmDialog from '../../../../components/feedback/ConfirmDialog';
import ErrorState from '../../../../components/feedback/ErrorState';
import PasswordInput from '../../../../components/premium/form/PasswordInput';
import IconAction from '../../../../components/premium/list/IconAction';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton, NoResults } from '../../../../components/premium/list/ListStates';
import Pagination from '../../../../components/premium/list/Pagination';
import Button from '../../../../components/ui/Button';
import Modal from '../../../../components/ui/Modal';
import { useToast } from '../../../../hooks/useToast';
import InstituteAdminGuard from '../../components/rbac/InstituteAdminGuard';
import { getUserAssignments, resetUserAssignmentPassword, revokeUserAssignment } from '../../api/roles.api';
import type { UserAssignment } from '../../types/canteen.types';
import { getApiErrorMessage } from '../../utils/errors';
import { useIsInstituteAdmin } from '../../utils/rbac.utils';

const PAGE_SIZE = 10;
const MIN_PASSWORD = 8;

const shortDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

// Change a person's login password, with a show/hide eye so it can be checked before saving.
function ResetPasswordDialog({ user, onClose }: { user: UserAssignment; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const reset = useMutation({
    mutationFn: () => resetUserAssignmentPassword(user.id, { new_password: password }),
    onSuccess: (result) => {
      setDone(result?.message || 'Password changed.');
      setPassword('');
    },
  });
  const tooShort = password.length > 0 && password.length < MIN_PASSWORD;

  return (
    <Modal isOpen onClose={() => !reset.isPending && onClose()} title="Reset password" size="md">
      {done ? (
        <div className="space-y-4">
          <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" /> {done} Share the new password with {user.user_name} privately.
          </p>
          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password.length >= MIN_PASSWORD) reset.mutate();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-slate-600">
            Set a new password for <span className="font-medium text-slate-900">{user.user_name}</span> ({user.username}).
          </p>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">New password</span>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoFocus />
            <span className={`mt-1 block text-xs ${tooShort ? 'text-red-600' : 'text-slate-500'}`}>
              {tooShort ? `${MIN_PASSWORD - password.length} more character${MIN_PASSWORD - password.length === 1 ? '' : 's'} needed` : `At least ${MIN_PASSWORD} characters.`}
            </span>
          </label>
          {reset.isError && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{getApiErrorMessage(reset.error, 'Could not reset the password')}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={reset.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={reset.isPending || password.length < MIN_PASSWORD}>
              {reset.isPending ? 'Saving…' : 'Set new password'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default function UsersPage() {
  const isAdmin = useIsInstituteAdmin();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingRevoke, setPendingRevoke] = useState<UserAssignment | null>(null);
  const [resetTarget, setResetTarget] = useState<UserAssignment | null>(null);

  const { data: users = [], isLoading, error, refetch } = useQuery({ queryKey: ['canteen', 'users'], queryFn: getUserAssignments, enabled: isAdmin });

  const revoke = useMutation({
    mutationFn: (user: UserAssignment) => revokeUserAssignment(user.id),
    onSuccess: (_, user) => {
      queryClient.setQueryData<UserAssignment[]>(['canteen', 'users'], (current) => current?.filter((u) => u.id !== user.id));
      toast.success(`${user.user_name} can no longer use Canteen`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not remove access')),
    onSettled: () => setPendingRevoke(null),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => [u.user_name, u.user_email, u.username, u.role?.name].some((v) => v?.toLowerCase().includes(q)));
  }, [users, search]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));

  const newButton = (
    <Link
      to="/canteen/users/new"
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-navy to-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110"
    >
      <UserPlus className="h-4 w-4" /> New user
    </Link>
  );
  const header = (
    <ListHeader
      icon={Users}
      title="Users"
      description="People who can use Canteen, and the role that decides what each one can do."
      actions={
        isAdmin && (
          <>
            <Link to="/canteen/roles" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
              <Shield className="h-4 w-4" /> Roles
            </Link>
            {newButton}
          </>
        )
      }
    />
  );

  if (!isAdmin) {
    return (
      <div className="space-y-5">
        {header}
        <InstituteAdminGuard section="Users" />
      </div>
    );
  }
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load users')} onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      {header}

      {isLoading ? (
        <ListSkeleton />
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users yet" message="Add the people who will take orders, run counters or manage wallets, and give each one a role." action={newButton} />
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
                placeholder="Search by name, email, username or role"
                aria-label="Search users"
                className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-10 text-sm shadow-soft ring-1 ring-slate-200/70 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="whitespace-nowrap text-xs text-slate-500">
              {filtered.length} user{filtered.length === 1 ? '' : 's'}
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
                      <th className="py-3 pl-5 pr-3">Person</th>
                      <th className="px-3 py-3">Username</th>
                      <th className="px-3 py-3">Role</th>
                      <th className="px-3 py-3">Added on</th>
                      <th className="py-3 pl-3 pr-5">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((user) => (
                      <tr key={user.id} className="transition-colors hover:bg-slate-50/80">
                        <td className="py-3.5 pl-5 pr-3">
                          <p className="font-semibold text-slate-900">{user.user_name}</p>
                          <p className="text-xs text-slate-500">{user.user_email}</p>
                        </td>
                        <td className="px-3 py-3.5 font-mono text-xs text-slate-600">{user.username}</td>
                        <td className="px-3 py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-navy">
                            <Shield className="h-3.5 w-3.5" /> {user.role?.name ?? `Role #${user.role_id}`}
                          </span>
                          {user.is_active === false && <span className="ml-2 text-xs font-medium text-slate-400">Inactive</span>}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">{shortDate(user.assigned_at)}</td>
                        <td className="py-3.5 pl-3 pr-5">
                          <div className="flex items-center justify-end gap-0.5">
                            <IconAction icon={KeyRound} label="Reset password" onClick={() => setResetTarget(user)} />
                            <IconAction icon={UserX} label="Remove access" tone="danger" onClick={() => setPendingRevoke(user)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} noun="users" />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingRevoke !== null}
        onClose={() => !revoke.isPending && setPendingRevoke(null)}
        onConfirm={() => pendingRevoke && revoke.mutate(pendingRevoke)}
        title="Remove access?"
        message={pendingRevoke ? `${pendingRevoke.user_name} will no longer be able to sign in to Canteen. You can add them again later.` : ''}
        confirmText={revoke.isPending ? 'Removing…' : 'Remove access'}
      />
      {resetTarget && <ResetPasswordDialog user={resetTarget} onClose={() => setResetTarget(null)} />}
    </div>
  );
}
