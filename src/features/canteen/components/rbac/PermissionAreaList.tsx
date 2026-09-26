import { useState } from 'react';
import { ChevronDown, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import IconAction from '../../../../components/premium/list/IconAction';
import type { Permission } from '../../types/canteen.types';
import { actionInfo, permissionSentence } from '../../utils/permissionLabels';

export interface PermissionArea {
  // e.g. "Menu Items" — the permission category.
  name: string;
  description: string;
  permissions: Permission[];
}

function ActionChip({ action, muted = false }: { action: string; muted?: boolean }) {
  const info = actionInfo(action);
  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={muted ? { background: '#f1f5f9', color: '#94a3b8' } : { background: `${info.color}14`, color: info.color }}
    >
      {info.label}
    </span>
  );
}

interface PermissionAreaListProps {
  areas: PermissionArea[];
  onDelete: (permission: Permission) => void;
}

// One row per area with its actions as plain-word chips; expand a row to see
// and manage the individual permissions.
export default function PermissionAreaList({ areas, onDelete }: PermissionAreaListProps) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className="divide-y divide-slate-100">
      {areas.map((area) => {
        const expanded = open === area.name;
        const panelId = `area-${area.name.replace(/\W+/g, '-')}`;
        return (
          <li key={area.name}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : area.name)}
              aria-expanded={expanded}
              aria-controls={panelId}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50/80 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)_auto]"
            >
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">{area.name}</span>
                <span className="block truncate text-xs text-slate-500">{area.description}</span>
              </span>
              <span className="col-span-2 row-start-2 flex flex-wrap gap-1.5 md:col-span-1 md:row-start-auto">
                {area.permissions.map((p) => (
                  <ActionChip key={p.permission_id} action={p.action} muted={!p.is_active} />
                ))}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            {expanded && (
              <div id={panelId} className="bg-slate-50/60 px-5 pb-4">
                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70">
                  {area.permissions.map((p) => (
                    <li key={p.permission_id} className="flex items-center gap-3 px-4 py-3">
                      <ActionChip action={p.action} muted={!p.is_active} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-800">{permissionSentence(p.action, area.name)}</p>
                        {/* Only show a description that says something the area row doesn't. */}
                        {p.description && p.description !== area.description && <p className="text-xs text-slate-500">{p.description}</p>}
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <code className="font-mono">{p.key}</code>
                          {p.is_system && (
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <ShieldCheck className="h-3 w-3" /> Built-in
                            </span>
                          )}
                          {!p.is_active && <span className="font-medium text-slate-500">Turned off</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <IconAction icon={Pencil} label="Edit permission" to={`/canteen/permissions/${p.permission_id}/edit`} />
                        <IconAction icon={Trash2} label="Delete permission" tone="danger" onClick={() => onDelete(p)} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
