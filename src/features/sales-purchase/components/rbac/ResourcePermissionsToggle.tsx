import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import type { PermissionResource, RolePermission } from '../../types/sales-purchase.types';
import { actionInfo, actionRank } from '../../utils/permissionLabels';

interface ResourcePermissionsToggleProps {
  resources: PermissionResource[];
  selectedPermissions: RolePermission[];
  onChange: (permissions: RolePermission[]) => void;
  myPermissions?: RolePermission[];
  isInstituteAdmin?: boolean;
  className?: string;
}

// Non-admins can only hand out what they have themselves.
function isActionAllowed(resource: string, action: string, myPermissions: RolePermission[], isInstituteAdmin: boolean): boolean {
  if (isInstituteAdmin) return true;
  return myPermissions.find((p) => p.resource === resource)?.actions.includes(action) ?? false;
}

// Small portalled hint for a disabled chip, so it's never clipped by the card.
function Hint({ anchor, text }: { anchor: HTMLElement; text: string }) {
  const rect = anchor.getBoundingClientRect();
  return createPortal(
    <span
      role="tooltip"
      className="pointer-events-none fixed z-[95] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-[#0b1f3f] px-2.5 py-1 text-xs font-medium text-white shadow-lg"
      style={{ top: rect.top - 6, left: rect.left + rect.width / 2 }}
    >
      {text}
    </span>,
    document.body,
  );
}

// One row per area; tap an action chip to allow it, or "All" for the whole area.
export default function ResourcePermissionsToggle({
  resources,
  selectedPermissions,
  onChange,
  myPermissions = [],
  isInstituteAdmin = false,
  className = '',
}: ResourcePermissionsToggleProps) {
  const [hint, setHint] = useState<{ anchor: HTMLElement; text: string } | null>(null);

  const selectedFor = (resource: string) => selectedPermissions.find((p) => p.resource === resource)?.actions ?? [];
  const allowedFor = (r: PermissionResource) => r.available_actions.filter((a) => isActionAllowed(r.resource, a, myPermissions, isInstituteAdmin));

  const setActions = (resource: string, actions: string[]) => {
    const next = selectedPermissions.filter((p) => p.resource !== resource);
    if (actions.length > 0) next.push({ resource, actions });
    onChange(next);
  };

  const toggleAction = (resource: string, action: string) => {
    if (!isActionAllowed(resource, action, myPermissions, isInstituteAdmin)) return;
    const current = selectedFor(resource);
    setActions(resource, current.includes(action) ? current.filter((a) => a !== action) : [...current, action]);
  };

  const toggleArea = (r: PermissionResource) => {
    const allowed = allowedFor(r);
    if (allowed.length === 0) return;
    const current = selectedFor(r.resource);
    setActions(r.resource, allowed.every((a) => current.includes(a)) ? [] : allowed);
  };

  const selectEverything = () =>
    onChange(resources.map((r) => ({ resource: r.resource, actions: allowedFor(r) })).filter((p) => p.actions.length > 0));

  const sorted = [...resources].sort((a, b) => a.name.localeCompare(b.name));
  const total = selectedPermissions.reduce((sum, p) => sum + p.actions.length, 0);
  const areaCount = selectedPermissions.filter((p) => p.actions.length > 0).length;

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{total}</span> permission{total === 1 ? '' : 's'} in{' '}
          <span className="font-semibold text-slate-900">{areaCount}</span> area{areaCount === 1 ? '' : 's'}
        </p>
        <div className="flex gap-1">
          <button type="button" onClick={selectEverything} className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand/10">
            Select everything
          </button>
          <button type="button" onClick={() => onChange([])} disabled={total === 0} className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-40">
            Clear
          </button>
        </div>
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
        {sorted.map((r) => {
          const selected = selectedFor(r.resource);
          const allowed = allowedFor(r);
          const allOn = allowed.length > 0 && allowed.every((a) => selected.includes(a));
          const actions = [...r.available_actions].sort((a, b) => actionRank(a) - actionRank(b));
          return (
            <li key={r.resource} className="grid gap-3 px-4 py-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-center">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500">
                    {selected.length === 0 ? 'No access' : `${selected.length} of ${r.available_actions.length} allowed`}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={allOn}
                  aria-label={`Allow everything in ${r.name}`}
                  onClick={() => toggleArea(r)}
                  disabled={allowed.length === 0}
                  className="flex items-center gap-2 text-xs font-medium text-slate-500 disabled:opacity-40 md:hidden"
                >
                  All
                  <span className={`relative h-5 w-9 rounded-full transition-colors ${allOn ? 'bg-brand' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${allOn ? 'left-[18px]' : 'left-0.5'}`} />
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {actions.map((action) => {
                    const on = selected.includes(action);
                    const can = isActionAllowed(r.resource, action, myPermissions, isInstituteAdmin);
                    const info = actionInfo(action);
                    return (
                      <button
                        key={action}
                        type="button"
                        aria-pressed={on}
                        aria-disabled={!can}
                        onClick={() => toggleAction(r.resource, action)}
                        onMouseEnter={(e) => !can && setHint({ anchor: e.currentTarget, text: "You don't have this yourself, so you can't give it" })}
                        onMouseLeave={() => setHint(null)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
                          !can ? 'cursor-not-allowed bg-slate-50 text-slate-300 ring-slate-100' : on ? 'text-white ring-transparent' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
                        }`}
                        style={can && on ? { background: info.color } : undefined}
                      >
                        {on && <Check className="h-3 w-3" />}
                        {info.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={allOn}
                  aria-label={`Allow everything in ${r.name}`}
                  onClick={() => toggleArea(r)}
                  disabled={allowed.length === 0}
                  className="hidden items-center gap-2 text-xs font-medium text-slate-500 disabled:opacity-40 md:flex"
                >
                  All
                  <span className={`relative h-5 w-9 rounded-full transition-colors ${allOn ? 'bg-brand' : 'bg-slate-300'}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${allOn ? 'left-[18px]' : 'left-0.5'}`} />
                  </span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {hint && <Hint anchor={hint.anchor} text={hint.text} />}
    </div>
  );
}
