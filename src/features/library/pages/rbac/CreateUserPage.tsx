import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import PasswordInput from '../../../../components/premium/form/PasswordInput';
import { useToast } from '../../../../hooks/useToast';
import InstituteAdminGuard from '../../components/rbac/InstituteAdminGuard';
import { createUserAssignment, getRoles } from '../../api/library.api';
import type { UserAssignmentFormData } from '../../types/library.types';
import { getApiErrorMessage } from '../../utils/errors';
import { useCanManageAccess } from '../../utils/rbac.utils';

const MIN_PASSWORD = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const input =
  'w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand';
const card = 'rounded-3xl bg-white p-5 sm:p-6 shadow-soft ring-1 ring-slate-200/70';

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </span>
      ) : (
        hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
}

// "raj.kumar@school.edu" -> "raj.kumar"
const usernameFromEmail = (email: string) => email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');

export default function CreateUserPage() {
  const isAdmin = useCanManageAccess();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: roles = [], isLoading } = useQuery({ queryKey: ['library', 'roles'], queryFn: getRoles, enabled: isAdmin });

  const [form, setForm] = useState<UserAssignmentFormData>({ eddva_user_id: '', user_name: '', user_email: '', username: '', password: '', role_id: 0 });
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const set = (patch: Partial<UserAssignmentFormData>) => setForm((f) => ({ ...f, ...patch }));

  // Suggest a username from the email until the admin types their own.
  const username = usernameTouched ? form.username : usernameFromEmail(form.user_email);
  const role = roles.find((r) => r.role_id === form.role_id);

  const create = useMutation({
    mutationFn: (data: UserAssignmentFormData) => createUserAssignment(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['library', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['library', 'roles'] });
      toast.success(`${data.user_name} can now use the Library`);
      navigate('/library/users');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'Could not add this user')),
  });

  const errors = {
    user_name: form.user_name.trim() ? undefined : 'Enter their full name',
    user_email: EMAIL.test(form.user_email.trim()) ? undefined : 'Enter a valid email address',
    eddva_user_id: form.eddva_user_id.trim() ? undefined : 'Enter their ERP user ID',
    username: username.trim() ? undefined : 'Choose a username',
    password: form.password.length >= MIN_PASSWORD ? undefined : `At least ${MIN_PASSWORD} characters`,
    role_id: form.role_id ? undefined : 'Choose a role',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (message?: string) => (showErrors ? message : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    create.mutate({
      eddva_user_id: form.eddva_user_id.trim(),
      user_name: form.user_name.trim(),
      user_email: form.user_email.trim(),
      username: username.trim(),
      password: form.password,
      role_id: Number(form.role_id),
    });
  };

  return (
    <div className="space-y-5">
      <Link to="/library/users" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> Users
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">New user</h1>
        <p className="mt-0.5 text-sm text-slate-500">Give someone a login for the Library and choose what they can do.</p>
      </div>

      {!isAdmin ? (
        <InstituteAdminGuard section="Users" />
      ) : isLoading ? (
        <div className="skeleton h-96 rounded-3xl" aria-busy="true" aria-label="Loading" />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <section className={card}>
            <h2 className="mb-4 text-base font-semibold text-slate-900">Person</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={show(errors.user_name)}>
                <input value={form.user_name} onChange={(e) => set({ user_name: e.target.value })} placeholder="e.g. Raj Kumar" autoComplete="off" className={input} />
              </Field>
              <Field label="Email" error={show(errors.user_email)}>
                <input type="email" value={form.user_email} onChange={(e) => set({ user_email: e.target.value })} placeholder="raj@school.edu" autoComplete="off" className={input} />
              </Field>
              <Field label="ERP user ID" hint="Their ID in the main ERP system." error={show(errors.eddva_user_id)}>
                <input value={form.eddva_user_id} onChange={(e) => set({ eddva_user_id: e.target.value })} placeholder="e.g. usr_librarian_001" autoComplete="off" className={input} />
              </Field>
            </div>
          </section>

          <section className={card}>
            <h2 className="mb-4 text-base font-semibold text-slate-900">Login</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Username" hint={!usernameTouched && username ? 'Suggested from their email — you can change it.' : undefined} error={show(errors.username)}>
                <input
                  value={username}
                  onChange={(e) => {
                    setUsernameTouched(true);
                    set({ username: e.target.value });
                  }}
                  placeholder="e.g. raj.kumar"
                  autoComplete="off"
                  className={`${input} font-mono`}
                />
              </Field>
              <Field label="Password" hint={`At least ${MIN_PASSWORD} characters. Share it with them privately.`} error={show(errors.password)}>
                <PasswordInput value={form.password} onChange={(e) => set({ password: e.target.value })} placeholder="Create a password" />
              </Field>
            </div>
          </section>

          <section className={card}>
            <h2 className="mb-4 text-base font-semibold text-slate-900">Role</h2>
            {roles.length === 0 ? (
              <p className="text-sm text-slate-600">
                There are no roles yet.{' '}
                <Link to="/library/roles/new" className="font-medium text-brand hover:text-brand-navy">
                  Create a role first
                </Link>
                .
              </p>
            ) : (
              <>
                <Field label="What can they do?" error={show(errors.role_id)}>
                  <select value={form.role_id || ''} onChange={(e) => set({ role_id: Number(e.target.value) })} className={`${input} sm:max-w-sm`}>
                    <option value="">Choose a role</option>
                    {roles.map((r) => (
                      <option key={r.role_id} value={r.role_id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </Field>
                {role?.description && (
                  <p className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-50/80 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" /> {role.description}
                  </p>
                )}
              </>
            )}
          </section>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/library/users')}
              disabled={create.isPending}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded-xl bg-gradient-to-r from-brand-navy to-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110 disabled:opacity-60"
            >
              {create.isPending ? 'Adding…' : 'Add user'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
