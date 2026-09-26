import { Link } from 'react-router-dom';
import { AlertTriangle, Eye, Pencil, Trash2 } from 'lucide-react';
import IconAction from '../../../../components/premium/list/IconAction';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import type { PurchaseOrder } from '../../types/sales-purchase.types';
import { awaitingDelivery, canEditPo, poStatusInfo } from '../../utils/poStatus';

const DAY_MS = 24 * 60 * 60 * 1000;

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Delivery date, or how late / due today while goods are still expected.
function deliveryNote(po: PurchaseOrder): { text: string; late: boolean } {
  if (!po.expected_delivery_date) return { text: '—', late: false };
  if (!awaitingDelivery(po.status)) return { text: shortDate(po.expected_delivery_date), late: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(po.expected_delivery_date);
  due.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - due.getTime()) / DAY_MS);
  if (days > 0) return { text: `Late by ${days} day${days === 1 ? '' : 's'}`, late: true };
  if (days === 0) return { text: 'Due today', late: false };
  return { text: shortDate(po.expected_delivery_date), late: false };
}

function StatusPill({ status }: { status: string }) {
  const info = poStatusInfo(status);
  const Icon = info.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `${info.color}1a`, color: info.color === '#94a3b8' ? '#64748b' : info.color }}
      title={info.hint}
    >
      <Icon className="h-3.5 w-3.5" />
      {info.label}
    </span>
  );
}

// View · Edit · Delete as icons; each label appears on hover. Edit stays visible
// but disabled past draft, with the reason as its tooltip.
function RowActions({ po, onDelete }: { po: PurchaseOrder; onDelete: (po: PurchaseOrder) => void }) {
  const detailsPath = `/sales-purchase/purchase-orders/${po.po_id}`;
  const editable = canEditPo(po.status);
  return (
    <div className="flex items-center justify-center gap-0.5">
      <IconAction icon={Eye} label="View order" to={detailsPath} tone="brand" />
      <IconAction
        icon={Pencil}
        label={editable ? 'Edit order' : 'Only draft orders can be edited'}
        to={editable ? `${detailsPath}/edit` : undefined}
        disabled={!editable}
      />
      <IconAction icon={Trash2} label="Delete order" onClick={() => onDelete(po)} tone="danger" />
    </div>
  );
}

interface PurchaseOrderListProps {
  purchaseOrders: PurchaseOrder[];
  onDelete: (po: PurchaseOrder) => void;
}

// A plain table on desktop (scrolls sideways if squeezed); the same rows
// stacked as short blocks on phones.
export default function PurchaseOrderList({ purchaseOrders, onDelete }: PurchaseOrderListProps) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 pl-5 pr-3">Order no.</th>
              <th className="px-3 py-3">Vendor</th>
              <th className="px-3 py-3">Ordered on</th>
              <th className="px-3 py-3">Delivery</th>
              <th className="px-3 py-3 text-right">Amount</th>
              <th className="px-3 py-3">Status</th>
              <th className="py-3 pl-3 pr-5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchaseOrders.map((po) => {
              const delivery = deliveryNote(po);
              return (
                <tr key={po.po_id} className="text-sm transition-colors hover:bg-slate-50/80">
                  <td className="py-3.5 pl-5 pr-3">
                    <Link to={`/sales-purchase/purchase-orders/${po.po_id}`} className="font-semibold text-brand-navy hover:text-brand hover:underline">
                      {po.po_number}
                    </Link>
                  </td>
                  <td className="max-w-[220px] truncate px-3 py-3.5 text-slate-700">{po.vendor?.vendor_name ?? '—'}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">{po.po_date ? shortDate(po.po_date) : '—'}</td>
                  <td className={`whitespace-nowrap px-3 py-3.5 ${delivery.late ? 'font-medium text-red-600' : 'text-slate-600'}`}>
                    <span className="inline-flex items-center gap-1">
                      {delivery.late && <AlertTriangle className="h-3.5 w-3.5" />}
                      {delivery.text}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-semibold text-slate-900 tabular-nums">{rupees(toNumber(po.grand_total))}</td>
                  <td className="px-3 py-3.5">
                    <StatusPill status={po.status} />
                  </td>
                  <td className="py-3.5 pl-3 pr-5">
                    <RowActions po={po} onDelete={onDelete} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {purchaseOrders.map((po) => {
          const delivery = deliveryNote(po);
          return (
            <li key={po.po_id} className="flex items-start gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Link to={`/sales-purchase/purchase-orders/${po.po_id}`} className="truncate font-semibold text-brand-navy">
                    {po.po_number}
                  </Link>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">{rupees(toNumber(po.grand_total))}</span>
                </div>
                <p className="truncate text-sm text-slate-600">{po.vendor?.vendor_name ?? '—'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <StatusPill status={po.status} />
                  <span>{po.po_date ? shortDate(po.po_date) : '—'}</span>
                  {delivery.late && (
                    <span className="inline-flex items-center gap-1 font-medium text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5" /> {delivery.text}
                    </span>
                  )}
                </div>
              </div>
              <RowActions po={po} onDelete={onDelete} />
            </li>
          );
        })}
      </ul>
    </>
  );
}
