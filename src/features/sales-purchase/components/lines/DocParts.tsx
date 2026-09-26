import { ClipboardList } from 'lucide-react';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { InfoCard } from '../../../../components/premium/detail/DetailParts';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';

export interface DocLine {
  id: number;
  name: string;
  code?: string;
  quantity: string | number;
  unitPrice: string | number;
  discount: string | number;
  tax: string | number;
  total: string | number;
  // Extra line under the item, e.g. "3 invoiced".
  note?: string;
}

const qty = (v: string | number) => toNumber(v).toLocaleString('en-IN', { maximumFractionDigits: 3 });

// Read-only lines of an order or invoice.
export function DocLinesCard({ lines, title = 'Items' }: { lines: DocLine[]; title?: string }) {
  return (
    <InfoCard title={`${title} · ${lines.length}`} icon={ClipboardList}>
      {lines.length === 0 ? (
        <p className="text-sm text-slate-500">No items.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 pr-3">Item</th>
                <th className="px-3 py-2.5 text-right">Qty</th>
                <th className="px-3 py-2.5 text-right">Price each</th>
                <th className="px-3 py-2.5 text-right">Discount</th>
                <th className="px-3 py-2.5 text-right">Tax</th>
                <th className="py-2.5 pl-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((l) => (
                <tr key={l.id}>
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-slate-900">{l.name}</p>
                    {(l.code || l.note) && (
                      <p className="text-[11px] text-slate-400">
                        {l.code}
                        {l.code && l.note && ' · '}
                        {l.note}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-700">{qty(l.quantity)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-700">{rupees(toNumber(l.unitPrice))}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-500">{toNumber(l.discount) > 0 ? `− ${rupees(toNumber(l.discount))}` : '—'}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-500">{rupees(toNumber(l.tax))}</td>
                  <td className="whitespace-nowrap py-2.5 pl-3 text-right font-semibold tabular-nums text-slate-900">{rupees(toNumber(l.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </InfoCard>
  );
}

// Subtotal / discount / tax / total, and optionally paid + balance.
export function DocTotalsCard({
  subtotal,
  discount,
  tax,
  total,
  paid,
  paidLabel = 'Paid',
  balanceLabel = 'Still to pay',
}: {
  subtotal: string | number;
  discount: string | number;
  tax: string | number;
  total: string | number;
  paid?: string | number;
  paidLabel?: string;
  balanceLabel?: string;
}) {
  const balance = paid === undefined ? undefined : Math.max(0, toNumber(total) - toNumber(paid));
  return (
    <InfoCard title="Amount" icon={FaIndianRupeeSign} delay={50}>
      <dl className="divide-y divide-slate-100 text-sm">
        <div className="flex justify-between py-2">
          <dt className="text-slate-500">Items total</dt>
          <dd className="font-medium tabular-nums text-slate-900">{rupees(toNumber(subtotal))}</dd>
        </div>
        {toNumber(discount) > 0 && (
          <div className="flex justify-between py-2">
            <dt className="text-slate-500">Discount</dt>
            <dd className="font-medium tabular-nums text-slate-900">− {rupees(toNumber(discount))}</dd>
          </div>
        )}
        <div className="flex justify-between py-2">
          <dt className="text-slate-500">Tax</dt>
          <dd className="font-medium tabular-nums text-slate-900">{rupees(toNumber(tax))}</dd>
        </div>
      </dl>
      <div className="mt-2 flex items-baseline justify-between rounded-2xl bg-brand-navy px-4 py-3 text-white">
        <span className="text-sm text-sky-100">Total</span>
        <span className="text-xl font-semibold tabular-nums">{rupees(toNumber(total))}</span>
      </div>
      {balance !== undefined && (
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">{paidLabel}</dt>
            <dd className="font-medium tabular-nums text-emerald-700">{rupees(toNumber(paid))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">{balanceLabel}</dt>
            <dd className={`font-semibold tabular-nums ${balance > 0 ? 'text-red-600' : 'text-slate-900'}`}>{rupees(balance)}</dd>
          </div>
        </dl>
      )}
    </InfoCard>
  );
}
