import { Ban, Check, XCircle } from 'lucide-react';
import type { PurchaseOrder } from '../../types/sales-purchase.types';
import { PO_FLOW, PO_STATUS } from '../../utils/poStatus';

function stamp(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// When each step on the normal path was reached, where the API records it.
function stepDate(po: PurchaseOrder, step: string): string | null {
  if (step === 'DRAFT') return stamp(po.created_at);
  if (step === 'PENDING_APPROVAL') return stamp(po.submitted_at);
  if (step === 'APPROVED') return stamp(po.approved_at);
  return null;
}

// How far along the normal path the order got (index into PO_FLOW).
function reachedIndex(po: PurchaseOrder): number {
  const index = PO_FLOW.indexOf(po.status as (typeof PO_FLOW)[number]);
  if (index >= 0) return index;
  // Rejected/cancelled: count the steps it had actually passed.
  if (po.approved_at) return PO_FLOW.indexOf('APPROVED');
  if (po.submitted_at) return PO_FLOW.indexOf('PENDING_APPROVAL');
  return 0;
}

// The order's journey: done steps ticked, current one highlighted, and a
// stop marker if it was rejected or cancelled.
export default function PoProgress({ po }: { po: PurchaseOrder }) {
  const reached = reachedIndex(po);
  const stopped = po.status === 'REJECTED' || po.status === 'CANCELLED';
  const stop = stopped
    ? {
        label: po.status === 'REJECTED' ? 'Rejected' : 'Cancelled',
        date: stamp(po.status === 'REJECTED' ? po.rejected_at : po.cancelled_at),
        icon: po.status === 'REJECTED' ? XCircle : Ban,
        color: po.status === 'REJECTED' ? '#d03b3b' : '#64748b',
      }
    : null;
  // A stopped order shows the steps it passed, then the stop marker.
  const steps = stopped ? PO_FLOW.slice(0, reached + 1) : PO_FLOW;

  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0">
      {steps.map((key, index) => {
        const info = PO_STATUS[key];
        const done = stopped || index < reached;
        const current = !stopped && index === reached;
        const date = stepDate(po, key);
        const isLast = index === steps.length - 1 && !stop;
        return (
          <li key={key} className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center">
            {/* Connector to the next step. */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 sm:left-1/2 sm:top-[15px] sm:h-0.5 sm:w-full"
                style={{ background: done ? info.color : '#e2e8f0' }}
              />
            )}
            <span
              className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-4 ring-white"
              style={
                done
                  ? { background: info.color, color: '#fff' }
                  : current
                    ? { background: '#fff', color: info.color, boxShadow: `inset 0 0 0 2px ${info.color}` }
                    : { background: '#f1f5f9', color: '#94a3b8' }
              }
            >
              {done ? <Check className="h-4 w-4" /> : <info.icon className="h-4 w-4" />}
            </span>
            <span className="min-w-0 sm:mt-2 sm:px-1">
              <span className={`block text-sm ${current ? 'font-semibold text-slate-900' : done ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                {info.label}
              </span>
              <span className="block text-[11px] text-slate-400">{date ?? (current ? 'Now' : '')}</span>
            </span>
          </li>
        );
      })}
      {stop && (
        <li className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center">
          <span
            className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white ring-4 ring-white"
            style={{ background: stop.color }}
          >
            <stop.icon className="h-4 w-4" />
          </span>
          <span className="sm:mt-2">
            <span className="block text-sm font-semibold" style={{ color: stop.color }}>
              {stop.label}
            </span>
            <span className="block text-[11px] text-slate-400">{stop.date ?? ''}</span>
          </span>
        </li>
      )}
    </ol>
  );
}
