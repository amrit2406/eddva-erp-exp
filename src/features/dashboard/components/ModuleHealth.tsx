import type { AttentionItem } from '../../../components/premium/AttentionList';

// How many modules are free of open items — pinned under the attention list.
export default function ModuleHealth({ items, moduleCount }: { items: AttentionItem[]; moduleCount: number }) {
  if (moduleCount === 0) return null;
  const flagged = new Set(items.map((item) => item.module.replace(/^(Sales|Purchase)$/, 'Sales & Purchase'))).size;
  const healthy = Math.max(0, moduleCount - flagged);
  const pct = (healthy / moduleCount) * 100;

  return (
    <div className="mt-4 rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-medium text-slate-600">Module health</span>
        <span className="text-slate-500">
          <span className="font-semibold text-slate-900 tabular-nums">{healthy}</span> of {moduleCount} with no open items
        </span>
      </div>
      <div
        className="mt-2 h-2 rounded-full bg-slate-200/70 overflow-hidden"
        role="meter"
        aria-label="Module health"
        aria-valuemin={0}
        aria-valuemax={moduleCount}
        aria-valuenow={healthy}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
