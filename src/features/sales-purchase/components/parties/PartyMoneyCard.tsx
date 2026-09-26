import { Link } from 'react-router-dom';
import { FaIndianRupeeSign } from 'react-icons/fa6';
import { InfoCard } from '../../../../components/premium/detail/DetailParts';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { shortDate } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { paymentStatusInfo } from '../../utils/party';

export interface MoneyRow {
  id: number;
  number: string;
  date: string;
  total: string | number;
  paid: string | number;
  paymentStatus: string;
  to: string;
}

const RECENT = 5;

// Invoiced / settled / outstanding for one vendor or customer, plus recent invoices.
export default function PartyMoneyCard({ kind, invoices, allTo }: { kind: 'vendor' | 'customer'; invoices: MoneyRow[]; allTo: string }) {
  const invoiced = invoices.reduce((s, i) => s + toNumber(i.total), 0);
  const settled = invoices.reduce((s, i) => s + toNumber(i.paid), 0);
  const outstanding = Math.max(0, invoiced - settled);
  const recent = [...invoices].sort((a, b) => b.id - a.id).slice(0, RECENT);

  const tiles = [
    { label: 'Invoiced', value: invoiced, tone: 'text-slate-900' },
    { label: kind === 'vendor' ? 'Paid to them' : 'Received', value: settled, tone: 'text-emerald-700' },
    { label: kind === 'vendor' ? 'Still to pay' : 'Still to receive', value: outstanding, tone: outstanding > 0 ? 'text-red-600' : 'text-slate-900' },
  ];

  return (
    <InfoCard title="Money" icon={FaIndianRupeeSign}>
      <div className="grid grid-cols-3 gap-2">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl bg-slate-50/80 px-3 py-2.5 ring-1 ring-slate-100">
            <p className="text-[11px] text-slate-500">{t.label}</p>
            <p className={`text-base font-semibold tabular-nums ${t.tone}`}>{rupees(t.value)}</p>
          </div>
        ))}
      </div>
      <p className="mb-1 mt-4 text-xs font-medium uppercase tracking-wider text-slate-500">Recent invoices</p>
      {recent.length === 0 ? (
        <p className="text-sm text-slate-500">No invoices yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {recent.map((i) => {
            const s = paymentStatusInfo(i.paymentStatus);
            return (
              <li key={i.id} className="flex items-center gap-3 py-2 text-sm">
                <Link to={i.to} className="font-medium text-brand-navy hover:text-brand">
                  {i.number}
                </Link>
                <span className="text-xs text-slate-400">{shortDate(i.date)}</span>
                <span className="ml-auto font-medium tabular-nums text-slate-900">{rupees(toNumber(i.total))}</span>
                <StatusPill label={s.label} color={s.color} />
              </li>
            );
          })}
        </ul>
      )}
      {invoices.length > RECENT && (
        <Link to={allTo} className="mt-2 inline-block text-sm font-medium text-brand hover:text-brand-navy">
          See all invoices
        </Link>
      )}
    </InfoCard>
  );
}
