import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Lock } from 'lucide-react';
import { getPermissions } from '../../api/roles.api';
import type { Permission, PermissionFormData } from '../../types/sales-purchase.types';
import { ACTION_LABEL, ACTION_ORDER, actionInfo, permissionSentence } from '../../utils/permissionLabels';

const NEW = '__new__';
const OTHER = '__other__';

// "Purchase Orders" -> "purchase_orders"; "Export CSV" -> "export_csv".
const toCode = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

// Existing naming style: "APPROVE Purchase Orders".
const defaultName = (action: string, area: string) => (action && area ? `${action.toUpperCase()} ${area}` : '');

const input =
  'w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-slate-50 disabled:text-slate-500';

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

interface Area {
  category: string;
  resource: string;
  description: string;
}

interface PermissionFormProps {
  // Present when editing.
  permission?: Permission;
  onSubmit: (data: PermissionFormData) => void;
  submitText: string;
  isSubmitting: boolean;
}

// Area + action pickers in plain words; codes and name are derived for you.
export default function PermissionForm({ permission, onSubmit, submitText, isSubmitting }: PermissionFormProps) {
  const navigate = useNavigate();
  const editing = Boolean(permission);
  const locked = Boolean(permission?.is_system);
  const { data: existing = [], isLoading } = useQuery({ queryKey: ['sales-purchase', 'permissions'], queryFn: getPermissions });

  const areas = useMemo<Area[]>(() => {
    const map = new Map<string, Area>();
    existing.forEach((p) => {
      if (!map.has(p.resource)) map.set(p.resource, { category: p.category, resource: p.resource, description: p.description });
    });
    return [...map.values()].sort((a, b) => a.category.localeCompare(b.category));
  }, [existing]);

  const [areaChoice, setAreaChoice] = useState(permission?.resource ?? '');
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaCode, setNewAreaCode] = useState('');
  const [actionChoice, setActionChoice] = useState(permission ? (ACTION_LABEL[permission.action] ? permission.action : OTHER) : '');
  const [otherAction, setOtherAction] = useState(permission && !ACTION_LABEL[permission.action] ? permission.action : '');
  const [name, setName] = useState(permission?.name ?? '');
  const [nameTouched, setNameTouched] = useState(editing);
  const [description, setDescription] = useState(permission?.description ?? '');
  const [descriptionTouched, setDescriptionTouched] = useState(editing);
  const [active, setActive] = useState(permission?.is_active ?? true);
  const [showErrors, setShowErrors] = useState(false);

  // An edited permission whose area isn't in the list (e.g. list still loading) keeps its own values.
  const pickedArea = areas.find((a) => a.resource === areaChoice) ?? (permission && areaChoice === permission.resource ? { category: permission.category, resource: permission.resource, description: permission.description } : undefined);
  const isNewArea = areaChoice === NEW;
  const category = isNewArea ? newAreaName.trim() : (pickedArea?.category ?? '');
  const resource = isNewArea ? newAreaCode || toCode(newAreaName) : (pickedArea?.resource ?? '');
  const action = actionChoice === OTHER ? toCode(otherAction) : actionChoice;
  const key = resource && action ? `${resource}:${action}` : '';

  const effectiveName = nameTouched ? name : defaultName(action, category);
  const effectiveDescription = descriptionTouched ? description : (pickedArea?.description ?? '');
  const duplicate = existing.find((p) => p.key === key && p.permission_id !== permission?.permission_id);

  const errors = {
    area: !resource || !category ? 'Choose an area, or name the new one' : undefined,
    action: !action ? 'Choose what this permission allows' : undefined,
    name: !effectiveName.trim() ? 'Give it a name' : undefined,
    description: !effectiveDescription.trim() ? 'Add a short description' : undefined,
    duplicate: duplicate ? `This permission already exists (${duplicate.key})` : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (message?: string) => (showErrors ? message : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onSubmit({
      resource,
      action,
      name: effectiveName.trim(),
      category,
      description: effectiveDescription.trim(),
      ...(editing ? { is_active: active } : {}),
    });
  };

  if (isLoading) return <div className="skeleton h-80 rounded-3xl" aria-busy="true" aria-label="Loading form" />;

  const knownActions = ACTION_ORDER.filter((a) => ACTION_LABEL[a]);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <section className="rounded-3xl bg-white p-5 sm:p-6 shadow-soft ring-1 ring-slate-200/70">
        {locked && (
          <p className="mb-4 flex items-start gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100">
            <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            This is a built-in permission, so its area and action can't be changed. You can still rename it, reword it, or turn it off.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Area" error={show(errors.area)} hint={!locked ? 'Which part of Sales & Purchase this is about.' : undefined}>
            <select value={areaChoice} onChange={(e) => setAreaChoice(e.target.value)} disabled={locked} className={input}>
              <option value="">Choose an area</option>
              {areas.map((a) => (
                <option key={a.resource} value={a.resource}>
                  {a.category}
                </option>
              ))}
              <option value={NEW}>New area…</option>
            </select>
          </Field>

          <Field label="Allows people to" error={show(errors.action)}>
            <select value={actionChoice} onChange={(e) => setActionChoice(e.target.value)} disabled={locked} className={input}>
              <option value="">Choose an action</option>
              {knownActions.map((a) => (
                <option key={a} value={a}>
                  {actionInfo(a).label}
                </option>
              ))}
              <option value={OTHER}>Other…</option>
            </select>
          </Field>

          {isNewArea && (
            <>
              <Field label="New area name">
                <input value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} placeholder="e.g. Delivery Challans" className={input} />
              </Field>
              <Field label="Area code" hint="Used by the system. Filled in from the name.">
                <input
                  value={newAreaCode || toCode(newAreaName)}
                  onChange={(e) => setNewAreaCode(toCode(e.target.value))}
                  placeholder="delivery_challans"
                  className={`${input} font-mono`}
                />
              </Field>
            </>
          )}

          {actionChoice === OTHER && (
            <Field label="Action name" hint="One or two words, e.g. “export”.">
              <input value={otherAction} onChange={(e) => setOtherAction(e.target.value)} disabled={locked} placeholder="e.g. export" className={input} />
            </Field>
          )}

          <Field label="Name" error={show(errors.name)}>
            <input
              value={effectiveName}
              onChange={(e) => {
                setNameTouched(true);
                setName(e.target.value);
              }}
              placeholder="e.g. APPROVE Purchase Orders"
              className={input}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Description" error={show(errors.description)}>
              <textarea
                value={effectiveDescription}
                onChange={(e) => {
                  setDescriptionTouched(true);
                  setDescription(e.target.value);
                }}
                rows={2}
                placeholder="What this lets someone do"
                className={input}
              />
            </Field>
          </div>

          {editing && (
            <div className="sm:col-span-2 flex items-center justify-between gap-4 rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-800">Turned {active ? 'on' : 'off'}</p>
                <p className="text-xs text-slate-500">When off, roles that include it can't use it.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={active}
                aria-label="Permission turned on"
                onClick={() => setActive((v) => !v)}
                className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${active ? 'bg-brand' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${active ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          )}
        </div>

        {/* What the result will mean, in one line. */}
        {key && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-sm">
            <p className="text-slate-700">
              Lets people: <span className="font-medium text-slate-900">{permissionSentence(action, category || 'this area')}</span>
            </p>
            <code className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500">{key}</code>
          </div>
        )}
        {errors.duplicate && (
          <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.duplicate}
          </p>
        )}
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => navigate('/sales-purchase/permissions')}
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
