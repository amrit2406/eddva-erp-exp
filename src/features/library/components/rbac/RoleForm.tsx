import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import ResourcePermissionsToggle from './ResourcePermissionsToggle';
import { getMyPermissions, getPermissionsCatalog } from '../../api/library.api';
import type { Role, RoleFormData, RolePermission } from '../../types/library.types';
import { filterGrantablePermissions, sanitizeRolePermissions, useIsInstituteAdmin } from '../../utils/rbac.utils';

const input =
  'w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand';

const card = 'rounded-3xl bg-white p-5 sm:p-6 shadow-soft ring-1 ring-slate-200/70';

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && (
        <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </span>
      )}
    </label>
  );
}

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: RoleFormData) => void;
  submitText: string;
  isSubmitting: boolean;
}

// Role name + what it's allowed to do, in plain words.
export default function RoleForm({ role, onSubmit, submitText, isSubmitting }: RoleFormProps) {
  const navigate = useNavigate();
  const isInstituteAdmin = useIsInstituteAdmin();
  const catalogQuery = useQuery({ queryKey: ['library', 'permissions-catalog'], queryFn: getPermissionsCatalog });
  const mineQuery = useQuery({
    queryKey: ['library', 'my-permissions'],
    queryFn: () => getMyPermissions().catch(() => [] as RolePermission[]),
  });

  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [selected, setSelected] = useState<RolePermission[]>(role?.permissions ?? []);
  const [showErrors, setShowErrors] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);

  const permissions = sanitizeRolePermissions(selected).filter((p) => p.actions.length > 0);
  const errors = {
    name: name.trim() ? undefined : 'Give the role a name',
    description: description.trim() ? undefined : 'Say in a few words who this role is for',
    permissions: permissions.length ? undefined : 'Allow at least one thing',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (message?: string) => (showErrors ? message : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGrantError(null);
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    const grantable = filterGrantablePermissions(permissions, mineQuery.data ?? [], isInstituteAdmin);
    if (grantable.length === 0) {
      setGrantError("You can only give permissions that your own account has in the Library.");
      return;
    }
    onSubmit({ name: name.trim(), description: description.trim(), permissions: grantable });
  };

  if (catalogQuery.isLoading || mineQuery.isLoading) {
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Loading form">
        <div className="skeleton h-32 rounded-3xl" />
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );
  }

  if (catalogQuery.isError) {
    return <div className={`${card} text-center text-sm text-red-600`}>We couldn't load the list of permissions. Please try again.</div>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <section className={card}>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Role details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role name" error={show(errors.name)}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Library Assistant" className={input} />
          </Field>
          <Field label="Who is it for?" error={show(errors.description)}>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Issues and returns books, collects fines"
              className={input}
            />
          </Field>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-base font-semibold text-slate-900">What can this role do?</h2>
        <p className="mb-4 text-sm text-slate-500">Tap an action to allow it, or switch on “All” for a whole area.</p>
        <ResourcePermissionsToggle
          resources={catalogQuery.data?.resources ?? []}
          selectedPermissions={selected}
          onChange={setSelected}
          myPermissions={mineQuery.data ?? []}
          isInstituteAdmin={isInstituteAdmin}
        />
        {(show(errors.permissions) || grantError) && (
          <p className="mt-3 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" /> {grantError ?? errors.permissions}
          </p>
        )}
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate('/library/roles')}
          disabled={isSubmitting}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-brand-navy to-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : submitText}
        </button>
      </div>
    </form>
  );
}
