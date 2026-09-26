import { useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react';
import { Ban, ChartColumn, CheckCircle2, ClipboardList, Download, IndianRupee } from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import { InfoCard } from '../../../../components/premium/detail/DetailParts';
import { Segmented, StatusPill } from '../../../../components/premium/list/ListControls';
import ListHeader from '../../../../components/premium/list/ListHeader';
import { EmptyState, ListSkeleton } from '../../../../components/premium/list/ListStates';
import PagedTable from '../../../../components/premium/list/PagedTable';
import { btnSecondary, inputClass } from '../../../../components/premium/styles';
import { rupees, toNumber } from '../../../../utils/dashboardFormat';
import { getCategorySalesReport, getItemSalesReport, getPaymentSummaryReport, getSalesReport, getShiftsReport } from '../../api/canteen.api';
import type { ReportParams, SalesReport, ShiftsReport as ShiftsReportData } from '../../types/canteen.types';
import { downloadCsv } from '../../utils/csv';
import { getApiErrorMessage } from '../../utils/errors';
import { cashDifference, dateTime, duration, paymentModeLabel } from '../../utils/labels';

type Tab = 'sales' | 'items' | 'categories' | 'payments' | 'shifts';
type Period = 'today' | 'week' | 'month' | 'all' | 'custom';

const TABS: { value: Tab; label: string }[] = [
  { value: 'sales', label: 'Summary' },
  { value: 'items', label: 'Items' },
  { value: 'categories', label: 'Categories' },
  { value: 'payments', label: 'Payments' },
  { value: 'shifts', label: 'Shifts' },
];

const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Pick dates' },
];

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayStart = (value: string) => new Date(`${value}T00:00:00`).toISOString();
const dayEnd = (value: string) => new Date(`${value}T23:59:59.999`).toISOString();

// Whole local days, sent as timestamps so the last day is included.
function periodParams(period: Period, from: string, to: string): ReportParams {
  const today = new Date();
  switch (period) {
    case 'today':
      return { dateFrom: dayStart(ymd(today)), dateTo: dayEnd(ymd(today)) };
    case 'week': {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return { dateFrom: dayStart(ymd(start)), dateTo: dayEnd(ymd(today)) };
    }
    case 'month':
      return { dateFrom: dayStart(ymd(new Date(today.getFullYear(), today.getMonth(), 1))), dateTo: dayEnd(ymd(today)) };
    case 'custom':
      return { dateFrom: from ? dayStart(from) : undefined, dateTo: to ? dayEnd(to) : undefined };
    default:
      return {};
  }
}

export default function CanteenReportsPage() {
  const [tab, setTab] = useState<Tab>('sales');
  const [period, setPeriod] = useState<Period>('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const params = periodParams(period, from, to);
  const key = ['canteen', 'report', params.dateFrom ?? '', params.dateTo ?? ''];
  const badRange = period === 'custom' && from && to && from > to;

  const sales = useQuery({ queryKey: [...key, 'sales'], queryFn: () => getSalesReport(params), enabled: tab === 'sales' && !badRange });
  const items = useQuery({ queryKey: [...key, 'items'], queryFn: () => getItemSalesReport(params), enabled: tab === 'items' && !badRange });
  const categories = useQuery({ queryKey: [...key, 'categories'], queryFn: () => getCategorySalesReport(params), enabled: tab === 'categories' && !badRange });
  const payments = useQuery({ queryKey: [...key, 'payments'], queryFn: () => getPaymentSummaryReport(params), enabled: tab === 'payments' && !badRange });
  const shifts = useQuery({ queryKey: [...key, 'shifts'], queryFn: () => getShiftsReport(params), enabled: tab === 'shifts' && !badRange });
  const active = { sales, items, categories, payments, shifts }[tab];

  const periodLabel = period === 'custom' ? [from, to].filter(Boolean).join(' to ') || 'All time' : PERIODS.find((p) => p.value === period)!.label;
  const fileName = `canteen-${tab}`;

  const exportCsv = () => {
    if (tab === 'items' && items.data) {
      downloadCsv(fileName, ['Item', 'Category', 'Quantity sold', 'Sales (₹)'], items.data.map((r) => [r.itemName, r.categoryName, r.quantitySold, r.totalSales]));
    } else if (tab === 'categories' && categories.data) {
      downloadCsv(fileName, ['Category', 'Items sold', 'Sales (₹)'], categories.data.map((r) => [r.categoryName, r.totalItemsSold, r.totalSales]));
    } else if (tab === 'payments' && payments.data) {
      downloadCsv(fileName, ['Paid by', 'Status', 'Payments', 'Amount (₹)'], payments.data.map((r) => [paymentModeLabel(r.paymentMode), r.status, r.transactionCount, r.totalAmount]));
    } else if (tab === 'shifts' && shifts.data) {
      downloadCsv(
        fileName,
        ['Counter', 'Started', 'Ended', 'Cash at start (₹)', 'Should be in till (₹)', 'Counted (₹)', 'Difference (₹)', 'Status'],
        shifts.data.shifts.map((s) => [s.terminal?.name ?? '', s.shiftStart, s.shiftEnd ?? '', toNumber(s.openingCash), toNumber(s.expectedCash), toNumber(s.closingCash), toNumber(s.variance), s.status]),
      );
    } else if (tab === 'sales' && sales.data) {
      const d = sales.data;
      downloadCsv(fileName, ['Measure', 'Value'], [
        ['Orders', d.totalOrders],
        ['Collected', d.completedOrders],
        ['Cancelled', d.cancelledOrders],
        ['Gross sales (₹)', d.grossSales],
        ['Discount (₹)', d.discount],
        ['Tax (₹)', d.tax],
        ['Net sales (₹)', d.netSales],
        ['Cash (₹)', d.cashSales],
        ['UPI (₹)', d.upiSales],
        ['Card (₹)', d.cardSales],
        ['Wallet (₹)', d.walletSales],
      ]);
    }
  };

  return (
    <div className="space-y-5">
      <ListHeader
        icon={ChartColumn}
        title="Reports"
        description="How the canteen is doing — sales, best sellers, payments and cash counts."
        actions={
          <button type="button" onClick={exportCsv} disabled={!active.data} className={btnSecondary}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Segmented label="Report" value={tab} onChange={(v) => setTab(v as Tab)} options={TABS} />
          <div className="flex flex-wrap items-center gap-2">
            <Segmented label="Period" value={period} onChange={(v) => setPeriod(v as Period)} options={PERIODS} />
          </div>
        </div>
        {period === 'custom' && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className={`${inputClass} w-auto`} />
            <span>to</span>
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} aria-label="To date" className={`${inputClass} w-auto`} />
            {badRange && <span className="text-xs text-red-600">The start date is after the end date.</span>}
          </div>
        )}
      </ListHeader>

      {badRange ? null : active.isLoading ? (
        <ListSkeleton />
      ) : active.error ? (
        <ErrorState message={getApiErrorMessage(active.error, 'Failed to load the report')} onRetry={() => active.refetch()} />
      ) : tab === 'sales' && sales.data ? (
        <SalesSummary data={sales.data} period={periodLabel} />
      ) : tab === 'items' && items.data ? (
        <ShareTable
          key={tab}
          empty="No items sold in this period."
          rows={[...items.data].sort((a, b) => b.totalSales - a.totalSales).map((r) => ({ key: r.itemId, name: r.itemName, sub: r.categoryName, qty: r.quantitySold, amount: r.totalSales }))}
          nameHeader="Item"
          qtyHeader="Sold"
        />
      ) : tab === 'categories' && categories.data ? (
        <ShareTable
          key={tab}
          empty="Nothing sold in this period."
          rows={[...categories.data].sort((a, b) => b.totalSales - a.totalSales).map((r) => ({ key: r.categoryName, name: r.categoryName, qty: r.totalItemsSold, amount: r.totalSales }))}
          nameHeader="Category"
          qtyHeader="Items sold"
        />
      ) : tab === 'payments' && payments.data ? (
        <ShareTable
          key={tab}
          empty="No payments in this period."
          rows={[...payments.data]
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .map((r) => ({ key: `${r.paymentMode}-${r.status}`, name: paymentModeLabel(r.paymentMode), sub: r.status === 'success' ? undefined : r.status, qty: r.transactionCount, amount: r.totalAmount }))}
          nameHeader="Paid by"
          qtyHeader="Payments"
        />
      ) : tab === 'shifts' && shifts.data ? (
        <ShiftsReport data={shifts.data} />
      ) : null}
    </div>
  );
}

function Tile({ label, value, hint, icon: Icon, color }: { label: string; value: string; hint?: string; icon: LucideIcon; color: string }) {
  return (
    <div className="animate-rise rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${color}1a`, color }}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function ShareBar({ share }: { share: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
        <span className="block h-full rounded-full bg-gradient-to-r from-brand-navy to-brand" style={{ width: `${share > 0 ? Math.max(2, share) : 0}%` }} />
      </span>
      <span className="w-10 text-right text-xs tabular-nums text-slate-500">{Math.round(share)}%</span>
    </span>
  );
}

function SalesSummary({ data, period }: { data: SalesReport; period: string }) {
  if (data.totalOrders === 0) return <EmptyState icon={ClipboardList} title="No orders in this period" message={`Nothing was ordered (${period.toLowerCase()}). Try a longer period.`} />;
  const channels = [
    ['Cash', data.cashSales],
    ['UPI', data.upiSales],
    ['Card', data.cardSales],
    ['Canteen wallet', data.walletSales],
  ] as const;
  const paidTotal = channels.reduce((s, [, v]) => s + v, 0);
  const rows: [string, ReactNode][] = [
    ['Food sold', rupees(data.grossSales)],
    ['Discounts', <span className="text-emerald-700">−{rupees(data.discount)}</span>],
    ['Tax', `+${rupees(data.tax)}`],
    ['Net sales', <span className="text-base font-semibold">{rupees(data.netSales)}</span>],
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Net sales" value={rupees(data.netSales)} hint={period} icon={IndianRupee} color="#008BE9" />
        <Tile label="Orders" value={`${data.totalOrders}`} hint={`Avg ${rupees(Math.round(data.netSales / Math.max(1, data.totalOrders - data.cancelledOrders)))} each`} icon={ClipboardList} color="#7c3aed" />
        <Tile label="Collected" value={`${data.completedOrders}`} hint="Handed over" icon={CheckCircle2} color="#15936a" />
        <Tile label="Cancelled" value={`${data.cancelledOrders}`} hint={data.totalOrders ? `${Math.round((data.cancelledOrders / data.totalOrders) * 100)}% of orders` : undefined} icon={Ban} color="#d03b3b" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <InfoCard title="How the money adds up" icon={IndianRupee} rows={rows} />
        <InfoCard title="How members paid" icon={IndianRupee} delay={60}>
          {paidTotal === 0 ? (
            <p className="text-sm text-slate-500">No payments received yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {channels.map(([label, value]) => (
                <li key={label} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="w-32 font-medium text-slate-800">{label}</span>
                  <ShareBar share={(value / paidTotal) * 100} />
                  <span className="ml-auto font-medium tabular-nums text-slate-900">{rupees(value)}</span>
                </li>
              ))}
            </ul>
          )}
          {paidTotal > 0 && paidTotal < data.netSales && <p className="mt-3 text-xs text-slate-500">{rupees(data.netSales - paidTotal)} of sales is still unpaid.</p>}
        </InfoCard>
      </div>
    </div>
  );
}

interface ShareRow {
  key: string;
  name: string;
  sub?: string;
  qty: number;
  amount: number;
}

function ShareTable({ rows, nameHeader, qtyHeader, empty }: { rows: ShareRow[]; nameHeader: string; qtyHeader: string; empty: string }) {
  const [page, setPage] = useState(1);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  if (rows.length === 0) return <EmptyState icon={ChartColumn} title="Nothing to show" message={empty} />;
  const rank = new Map(rows.map((r, i) => [r.key, i + 1]));
  return (
    <PagedTable
      rows={rows}
      rowKey={(r) => r.key}
      page={page}
      onPage={setPage}
      noun="rows"
      minWidth={620}
      columns={[
        { header: '#', className: 'w-12', cell: (r) => <span className="text-xs font-semibold text-slate-400">{rank.get(r.key)}</span> },
        {
          header: nameHeader,
          cell: (r) => (
            <div>
              <span className="font-medium text-slate-900">{r.name}</span>
              {r.sub && <p className="text-xs text-slate-500">{r.sub}</p>}
            </div>
          ),
        },
        { header: qtyHeader, align: 'right', cell: (r) => <span className="text-slate-700">{r.qty.toLocaleString('en-IN')}</span> },
        { header: 'Amount', align: 'right', cell: (r) => <span className="font-medium text-slate-900">{rupees(r.amount)}</span> },
        { header: 'Share', cell: (r) => <ShareBar share={total ? (r.amount / total) * 100 : 0} /> },
      ]}
    />
  );
}

function ShiftsReport({ data }: { data: ShiftsReportData }) {
  const [page, setPage] = useState(1);
  const { summary, shifts } = data;
  if (shifts.length === 0) return <EmptyState icon={ChartColumn} title="No shifts in this period" message="Shifts opened and closed in this period will show here." />;
  const diff = cashDifference(summary.totalVariance);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Shifts" value={`${summary.totalShifts}`} hint={`${summary.openShiftsCount} still open`} icon={ClipboardList} color="#7c3aed" />
        <Tile label="Should be in tills" value={rupees(summary.totalExpectedCash)} icon={IndianRupee} color="#008BE9" />
        <Tile label="Counted" value={rupees(summary.totalClosingCash)} icon={CheckCircle2} color="#15936a" />
        <Tile label="Difference" value={diff.label} hint="Counted vs expected" icon={Ban} color={diff.color} />
      </div>
      <PagedTable
        rows={[...shifts].sort((a, b) => b.shiftStart.localeCompare(a.shiftStart))}
        rowKey={(s) => s.id}
        page={page}
        onPage={setPage}
        noun="shifts"
        minWidth={760}
        columns={[
          {
            header: 'Counter',
            cell: (s) => (
              <div>
                <span className="font-medium text-slate-900">{s.terminal?.name ?? 'Counter'}</span>
                <p className="text-xs text-slate-500">
                  {dateTime(s.shiftStart)} · {duration(s.shiftStart, s.shiftEnd)}
                </p>
              </div>
            ),
          },
          { header: 'At start', align: 'right', cell: (s) => <span className="text-slate-700">{rupees(toNumber(s.openingCash))}</span> },
          { header: 'Should be', align: 'right', cell: (s) => <span className="text-slate-700">{s.status === 'CLOSED' ? rupees(toNumber(s.expectedCash)) : '—'}</span> },
          { header: 'Counted', align: 'right', cell: (s) => <span className="text-slate-700">{s.status === 'CLOSED' ? rupees(toNumber(s.closingCash)) : '—'}</span> },
          {
            header: 'Result',
            cell: (s) => {
              if (s.status === 'OPEN') return <StatusPill label="Open now" color="#15936a" />;
              const d = cashDifference(toNumber(s.variance));
              return <StatusPill label={d.label} color={d.color} />;
            },
          },
        ]}
      />
    </div>
  );
}
