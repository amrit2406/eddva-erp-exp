import { EmptyChart } from '../../../../components/premium/charts';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import type { PurchaseOrderItem } from '../../types/sales-purchase.types';

const qty = (value: string | number) => toNumber(value).toLocaleString('en-IN', { maximumFractionDigits: 3 });

// Received vs ordered as a small bar, so partial deliveries are obvious.
function ReceivedBar({ ordered, received }: { ordered: number; received: number }) {
  const pct = ordered > 0 ? Math.min(100, (received / ordered) * 100) : 0;
  const complete = ordered > 0 && received >= ordered;
  return (
    <div className="min-w-[96px]">
      <p className={`text-xs tabular-nums ${complete ? 'font-medium text-emerald-700' : 'text-slate-600'}`}>
        {qty(received)} of {qty(ordered)}
      </p>
      <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden" role="meter" aria-valuemin={0} aria-valuemax={ordered} aria-valuenow={received} aria-label="Received">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: complete ? '#15936a' : '#008BE9' }} />
      </div>
    </div>
  );
}

// Ordered items with how much of each has arrived.
export default function PoItems({ items }: { items: PurchaseOrderItem[] }) {
  if (items.length === 0) return <EmptyChart message="No items on this order" />;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 pr-3">Item</th>
              <th className="px-3 py-2.5">Received</th>
              <th className="px-3 py-2.5 text-right">Price each</th>
              <th className="px-3 py-2.5 text-right">Discount</th>
              <th className="px-3 py-2.5 text-right">Tax</th>
              <th className="py-2.5 pl-3 text-right">Line total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((line) => (
              <tr key={line.po_item_id}>
                <td className="py-3 pr-3">
                  <p className="font-medium text-slate-900">{line.item?.item_name ?? `Item #${line.item_id}`}</p>
                  <p className="text-xs text-slate-500">
                    {line.item?.item_code && `${line.item.item_code} · `}
                    {qty(line.quantity)} ordered
                  </p>
                </td>
                <td className="px-3 py-3">
                  <ReceivedBar ordered={toNumber(line.quantity)} received={toNumber(line.received_qty)} />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">{rupees(toNumber(line.unit_price))}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-500">
                  {toNumber(line.line_discount) > 0 ? `− ${rupees(toNumber(line.line_discount))}` : '—'}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-500">
                  {rupees(toNumber(line.line_tax_amount))}
                  {line.tax_code?.name && <span className="block text-[11px] text-slate-400">{line.tax_code.name}</span>}
                </td>
                <td className="whitespace-nowrap py-3 pl-3 text-right font-semibold tabular-nums text-slate-900">{rupees(toNumber(line.line_total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((line) => (
          <li key={line.po_item_id} className="py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">{line.item?.item_name ?? `Item #${line.item_id}`}</p>
                <p className="text-xs text-slate-500">
                  {qty(line.quantity)} × {rupees(toNumber(line.unit_price))}
                  {toNumber(line.line_tax_amount) > 0 && ` · tax ${rupees(toNumber(line.line_tax_amount))}`}
                </p>
              </div>
              <p className="font-semibold tabular-nums text-slate-900">{rupees(toNumber(line.line_total))}</p>
            </div>
            <div className="mt-2">
              <ReceivedBar ordered={toNumber(line.quantity)} received={toNumber(line.received_qty)} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
