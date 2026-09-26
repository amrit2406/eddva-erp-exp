import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, PackageCheck } from 'lucide-react';
import { Field, FormActions, FormCard, FormLoading } from '../../../../components/premium/form/FormParts';
import { inputClass } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getPurchaseOrder, getPurchaseOrders, getWarehouses } from '../../api/sales-purchase.api';
import type { GRNFormData, GRNItemFormData } from '../../types/sales-purchase.types';
import { awaitingDelivery } from '../../utils/poStatus';

interface GRNFormProps {
  defaultValues?: GRNFormData;
  // Pre-select this purchase order (e.g. from the order's "Record goods received").
  initialPoId?: number;
  onSubmit?: (data: GRNFormData) => void;
  submitText?: string;
  isSubmitting?: boolean;
}

interface LineEntry {
  received: string;
  rejected: string;
}

const todayIso = () => new Date().toISOString().split('T')[0];
const qty = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 3 });

// Pick the purchase order; every line appears with what's still due pre-filled.
export default function GRNForm({ defaultValues, initialPoId, onSubmit, submitText = 'Save', isSubmitting = false }: GRNFormProps) {
  const ordersQ = useQuery({ queryKey: ['sales-purchase', 'purchase-orders'], queryFn: getPurchaseOrders });
  const warehousesQ = useQuery({ queryKey: ['sales-purchase', 'warehouses'], queryFn: getWarehouses });
  const [poId, setPoId] = useState(defaultValues?.purchase_order_id ?? initialPoId ?? 0);
  const poQ = useQuery({ queryKey: ['sales-purchase', 'purchase-order', String(poId)], queryFn: () => getPurchaseOrder(poId), enabled: poId > 0 });

  const [date, setDate] = useState(defaultValues?.received_date?.split('T')[0] ?? todayIso());
  const [warehouseChoice, setWarehouseChoice] = useState(defaultValues?.warehouse_id ?? 0);
  // Keyed by po_item_id; lines not yet touched fall back to "still due".
  const [entries, setEntries] = useState<Record<number, LineEntry>>(() =>
    Object.fromEntries((defaultValues?.items ?? []).map((i) => [i.po_item_id, { received: String(i.received_qty), rejected: String(i.rejected_qty) }])),
  );
  const [showErrors, setShowErrors] = useState(false);

  if (ordersQ.isLoading || warehousesQ.isLoading) return <FormLoading />;

  // Orders still waiting for goods, plus the one already chosen (when editing).
  const orders = (ordersQ.data ?? []).filter((o) => awaitingDelivery(o.status) || o.po_id === poId).sort((a, b) => b.po_id - a.po_id);
  const warehouses = warehousesQ.data ?? [];
  const po = poId > 0 ? poQ.data : undefined;
  const warehouseId = warehouseChoice || po?.warehouse_id || 0;
  const editing = Boolean(defaultValues);

  const lines = (po?.items ?? []).map((line) => {
    const ordered = toNumber(line.quantity);
    // When editing, this GRN's own quantity is already included in received_qty.
    const own = editing ? Number(defaultValues?.items.find((i) => i.po_item_id === line.po_item_id)?.received_qty ?? 0) : 0;
    const already = Math.max(0, toNumber(line.received_qty) - own);
    const due = Math.max(0, ordered - already);
    const entry = entries[line.po_item_id] ?? { received: editing ? '0' : String(due), rejected: '0' };
    const received = entry.received === '' ? 0 : Number(entry.received);
    const rejected = entry.rejected === '' ? 0 : Number(entry.rejected);
    return { line, ordered, already, due, entry, received, rejected, accepted: received - rejected };
  });

  const setEntry = (id: number, patch: Partial<LineEntry>, current: LineEntry) => setEntries((e) => ({ ...e, [id]: { ...current, ...patch } }));
  const receiving = lines.filter((l) => l.received > 0);
  const lineError = lines.find((l) => l.received < 0 || l.rejected < 0 || l.rejected > l.received || l.received > l.due);

  const errors = {
    po: poId ? undefined : 'Choose the purchase order these goods came against',
    warehouse: warehouseId ? undefined : 'Choose where the goods were received',
    date: date ? undefined : 'Pick the date received',
    lines: !po ? undefined : lineError ? `Check “${lineError.line.item?.item_name ?? 'an item'}”: received can't be more than still due, and rejected can't be more than received` : receiving.length === 0 ? 'Enter a received quantity for at least one item' : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const show = (m?: string) => (showErrors ? m : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    const items: GRNItemFormData[] = receiving.map((l) => ({ po_item_id: l.line.po_item_id, received_qty: l.received, accepted_qty: l.accepted, rejected_qty: l.rejected }));
    onSubmit?.({ purchase_order_id: poId, received_date: date, warehouse_id: warehouseId, items });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormCard title="Delivery details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Purchase order" error={show(errors.po)}>
            <select
              value={poId || ''}
              onChange={(e) => {
                setPoId(Number(e.target.value));
                setEntries({});
              }}
              disabled={editing}
              className={inputClass}
            >
              <option value="">Choose an order</option>
              {orders.map((o) => (
                <option key={o.po_id} value={o.po_id}>
                  {o.po_number} · {o.vendor?.vendor_name ?? 'Vendor'} · {rupees(toNumber(o.grand_total))}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Received on" error={show(errors.date)}>
            <input type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Received at" error={show(errors.warehouse)}>
            <select value={warehouseId || ''} onChange={(e) => setWarehouseChoice(Number(e.target.value))} className={inputClass}>
              <option value="">Choose a warehouse</option>
              {warehouses.map((w) => (
                <option key={w.warehouse_id} value={w.warehouse_id}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {orders.length === 0 && !editing && (
          <p className="mt-3 text-sm text-slate-500">
            No purchase orders are waiting for goods. Goods can only be received against an{' '}
            <Link to="/sales-purchase/purchase-orders?status=APPROVED" className="font-medium text-brand">
              approved purchase order
            </Link>
            .
          </p>
        )}
      </FormCard>

      <FormCard title="What arrived?" description={po ? `From ${po.vendor?.vendor_name ?? 'the vendor'} against ${po.po_number}. Quantities default to what's still due.` : undefined}>
        {!poId ? (
          <p className="text-sm text-slate-500">Choose a purchase order to see its items.</p>
        ) : poQ.isLoading ? (
          <div className="space-y-2">
            <div className="skeleton h-12 rounded-xl" />
            <div className="skeleton h-12 rounded-xl" />
          </div>
        ) : lines.length === 0 ? (
          <p className="text-sm text-slate-500">This order has no items.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-3">Item</th>
                  <th className="px-3 py-2.5 text-right">Ordered</th>
                  <th className="px-3 py-2.5 text-right">Still due</th>
                  <th className="px-3 py-2.5">Received now</th>
                  <th className="px-3 py-2.5">Rejected</th>
                  <th className="py-2.5 pl-3 text-right">Accepted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((l) => {
                  const bad = l.received > l.due || l.rejected > l.received || l.received < 0 || l.rejected < 0;
                  return (
                    <tr key={l.line.po_item_id}>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-slate-900">{l.line.item?.item_name ?? `Item #${l.line.item_id}`}</p>
                        {l.already > 0 && <p className="text-xs text-slate-500">{qty(l.already)} received earlier</p>}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{qty(l.ordered)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-medium text-slate-900">{l.due > 0 ? qty(l.due) : <span className="text-emerald-700">All in</span>}</td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          max={l.due}
                          value={l.entry.received}
                          onChange={(e) => setEntry(l.line.po_item_id, { received: e.target.value }, l.entry)}
                          disabled={l.due === 0 && !editing}
                          aria-label={`Received now: ${l.line.item?.item_name ?? 'item'}`}
                          className={`${inputClass} w-28 ${bad ? 'ring-red-300' : ''}`}
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          value={l.entry.rejected}
                          onChange={(e) => setEntry(l.line.po_item_id, { rejected: e.target.value }, l.entry)}
                          disabled={l.received <= 0}
                          aria-label={`Rejected: ${l.line.item?.item_name ?? 'item'}`}
                          className={`${inputClass} w-24`}
                        />
                      </td>
                      <td className="py-2.5 pl-3 text-right tabular-nums font-semibold text-slate-900">{l.received > 0 ? qty(Math.max(0, l.accepted)) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {show(errors.lines) && (
          <p className="mt-3 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.lines}
          </p>
        )}
        {po && receiving.length > 0 && (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <PackageCheck className="h-4 w-4 text-emerald-600" /> Receiving {receiving.length} of {lines.length} item{lines.length === 1 ? '' : 's'}.
          </p>
        )}
      </FormCard>

      <FormActions submitText={submitText} isSubmitting={isSubmitting} />
    </form>
  );
}
