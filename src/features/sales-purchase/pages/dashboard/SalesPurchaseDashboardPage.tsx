import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  BadgeIndianRupee,
  BarChart3,
  Bell,
  Building2,
  CalendarRange,
  ClipboardCheck,
  FileClock,
  Handshake,
  HandCoins,
  PackageCheck,
  PieChart as PieIcon,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Stamp,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Workflow,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../../components/premium/AttentionList';
import { ChartCard, DonutChart, Gauge, GroupedColumns, Leaderboard } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { compactRupees, humanize, rupees } from '../../../../utils/dashboardFormat';
import { formatDate } from '../../../../utils/formatDate';
import { getDashboardSummary } from '../../api/sales-purchase.api';
import type { DashboardSummary } from '../../types/sales-purchase.types';
import { getApiErrorMessage } from '../../utils/errors';

const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

function rangeLabel(range: DashboardSummary['range']): string {
  if (!range.from && !range.to) return 'All time';
  return `${range.from ? formatDate(range.from) : '…'} – ${range.to ? formatDate(range.to) : 'today'}`;
}

// Share of the invoiced value that has been settled; 0 when nothing was invoiced.
function settledPct(total: number, outstanding: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, ((total - outstanding) / total) * 100));
}

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
}

function buildKpis({ sales, purchase, customer_count, vendor_count, active_item_count }: DashboardSummary): Kpi[] {
  return [
    { label: 'Sales invoiced', value: rupees(sales.invoices.period_grand_total), icon: TrendingUp, hint: `${sales.invoices.period_count} invoices`, accent: '#008BE9' },
    { label: 'Purchases invoiced', value: rupees(purchase.invoices.period_grand_total), icon: ShoppingCart, hint: `${purchase.invoices.period_count} invoices`, accent: '#eb6834' },
    { label: 'Receivable', value: rupees(sales.invoices.outstanding_amount), icon: HandCoins, hint: `${sales.invoices.outstanding_count} invoices unpaid`, accent: '#15936a' },
    { label: 'Payable', value: rupees(purchase.invoices.outstanding_amount), icon: Wallet, hint: `${purchase.invoices.outstanding_count} invoices unpaid`, accent: '#d55181' },
    { label: 'Customers', value: customer_count, icon: Users, hint: `${sales.sales_orders.open_count} open sales orders`, accent: '#4a3aa7' },
    { label: 'Vendors', value: vendor_count, icon: Building2, hint: `${purchase.purchase_orders.open_count} open purchase orders`, accent: '#7c3aed' },
    { label: 'Active items', value: active_item_count, icon: PackageCheck, hint: 'In the item master', accent: '#c98500' },
    { label: 'Tax on sales', value: rupees(sales.invoices.period_tax), icon: BadgeIndianRupee, hint: `${rupees(purchase.invoices.period_tax)} paid on purchases`, accent: '#0891b2' },
  ];
}

function buildAttention({ sales, purchase }: DashboardSummary): AttentionItem[] {
  const items: AttentionItem[] = [
    {
      module: 'Sales',
      label: 'Overdue sales invoices',
      count: sales.invoices.overdue_count,
      detail: rupees(sales.invoices.overdue_amount),
      severity: 'critical',
      to: '/sales-purchase/sales-invoices',
    },
    {
      module: 'Purchase',
      label: 'Overdue purchase invoices',
      count: purchase.invoices.overdue_count,
      detail: rupees(purchase.invoices.overdue_amount),
      severity: 'critical',
      to: '/sales-purchase/invoices',
    },
    {
      module: 'Purchase',
      label: 'POs awaiting approval',
      count: purchase.purchase_orders.pending_approval_count,
      detail: rupees(purchase.purchase_orders.pending_approval_value),
      severity: 'warning',
      to: '/sales-purchase/purchase-orders',
    },
    { module: 'Purchase', label: 'Draft GRNs to post', count: purchase.grns.draft_count, severity: 'warning', to: '/sales-purchase/grn' },
    {
      module: 'Sales',
      label: 'Unpaid sales invoices',
      count: sales.invoices.outstanding_count,
      detail: `${rupees(sales.invoices.outstanding_amount)} to collect`,
      severity: 'warning',
      to: '/sales-purchase/sales-receipts',
    },
    {
      module: 'Purchase',
      label: 'Unpaid purchase invoices',
      count: purchase.invoices.outstanding_count,
      detail: `${rupees(purchase.invoices.outstanding_amount)} to pay`,
      severity: 'warning',
      to: '/sales-purchase/payments',
    },
  ];
  return items.filter((item) => item.count > 0);
}

// Settlement bars pinned under the attention list.
function SettlementFooter({ summary }: { summary: DashboardSummary }) {
  const bars = [
    { label: 'Receivables collected', pct: settledPct(summary.sales.invoices.period_grand_total, summary.sales.invoices.outstanding_amount) },
    { label: 'Payables settled', pct: settledPct(summary.purchase.invoices.period_grand_total, summary.purchase.invoices.outstanding_amount) },
  ];
  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
      {bars.map((bar) => (
        <div key={bar.label}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-slate-600">{bar.label}</span>
            <span className="font-semibold text-slate-900 tabular-nums">{Math.round(bar.pct)}%</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-slate-200/70 overflow-hidden" role="meter" aria-label={bar.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(bar.pct)}>
            <div className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand transition-[width] duration-700 ease-out" style={{ width: `${bar.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// PO approval -> open PO -> goods received, as connected steps.
function ProcurementFlow({ summary }: { summary: DashboardSummary }) {
  const { purchase_orders: po, grns } = summary.purchase;
  const steps = [
    { icon: Stamp, label: 'Awaiting approval', value: po.pending_approval_count, hint: rupees(po.pending_approval_value), color: '#c98500' },
    { icon: ClipboardCheck, label: 'Open purchase orders', value: po.open_count, hint: 'Approved, not yet closed', color: '#008BE9' },
    { icon: FileClock, label: 'GRNs in draft', value: grns.draft_count, hint: 'Received, not posted', color: '#d55181' },
    { icon: PackageCheck, label: 'GRNs posted', value: grns.posted_count, hint: 'Stock received', color: '#15936a' },
  ];

  return (
    <ol className="relative space-y-3">
      <span aria-hidden className="absolute left-[19px] top-5 bottom-5 w-px bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200" />
      {steps.map(({ icon: Icon, label, value, hint, color }) => (
        <li key={label} className="relative flex items-center gap-3">
          <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
            <Icon className="h-[18px] w-[18px]" style={{ color }} />
          </div>
          <div className="flex flex-1 items-center justify-between gap-3 rounded-2xl bg-slate-50/80 px-4 py-2.5 ring-1 ring-slate-100">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{label}</p>
              <p className="text-[11px] text-slate-500 truncate">{hint}</p>
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function SalesPurchaseDashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['sales-purchase', 'dashboard'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load dashboard')} onRetry={() => refetch()} />;
  if (!data) return null;

  const { sales, purchase } = data;
  const kpis = buildKpis(data);
  const attention = buildAttention(data);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Sales & Purchase"
            title="Commerce overview"
            subtitle="Orders, invoices and settlements across customers and vendors."
            highlights={[
              { icon: CalendarRange, label: rangeLabel(data.range) },
              { icon: Receipt, label: `${sales.sales_orders.open_count} open sales orders` },
              { icon: ShoppingBag, label: `${purchase.purchase_orders.open_count} open purchase orders` },
            ]}
            updatedAt={dataUpdatedAt}
            refreshing={isFetching}
            onRefresh={() => refetch()}
          />
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi, index) => (
              <KpiTile key={kpi.label} {...kpi} style={stagger(index)} />
            ))}
          </div>
        </div>

        <ChartCard title="Needs attention" subtitle="Invoices and orders to act on" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<SettlementFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Money flow" title="Invoices & settlement" />

        <ChartCard tone="dark" title="Sales vs purchase" subtitle={`Invoice value · ${rangeLabel(data.range)}`} icon={BarChart3} className="lg:col-span-7">
          <div className="mb-4 grid grid-cols-2 gap-3">
            {[
              { name: 'Sales', invoices: sales.invoices, color: '#1f8fe6' },
              { name: 'Purchase', invoices: purchase.invoices, color: '#e66a36' },
            ].map((s) => (
              <div key={s.name} className="rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                <p className="flex items-center gap-1.5 text-xs text-sky-100/75">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </p>
                <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{rupees(s.invoices.period_grand_total)}</p>
                <p className="text-[11px] text-sky-100/60">
                  {s.invoices.period_count} invoices · {rupees(s.invoices.period_discount)} discount
                </p>
              </div>
            ))}
          </div>
          <GroupedColumns
            tone="dark"
            rows={[
              { label: 'Subtotal', sales: sales.invoices.period_subtotal, purchase: purchase.invoices.period_subtotal },
              { label: 'Tax', sales: sales.invoices.period_tax, purchase: purchase.invoices.period_tax },
              { label: 'Outstanding', sales: sales.invoices.outstanding_amount, purchase: purchase.invoices.outstanding_amount },
              { label: 'Overdue', sales: sales.invoices.overdue_amount, purchase: purchase.invoices.overdue_amount },
            ]}
            series={[
              { key: 'sales', name: 'Sales' },
              { key: 'purchase', name: 'Purchase' },
            ]}
            format={compactRupees}
            height={230}
          />
        </ChartCard>

        <ChartCard title="Settlement" subtitle="Invoiced value already paid" icon={HandCoins} className="lg:col-span-5" style={stagger(1)}>
          <div className="grid grid-cols-2 gap-3">
            <Gauge
              label="Collected from customers"
              value={settledPct(sales.invoices.period_grand_total, sales.invoices.outstanding_amount)}
              max={100}
              caption={`${rupees(sales.invoices.outstanding_amount)} still due`}
              color="#008BE9"
            />
            <Gauge
              label="Paid to vendors"
              value={settledPct(purchase.invoices.period_grand_total, purchase.invoices.outstanding_amount)}
              max={100}
              caption={`${rupees(purchase.invoices.outstanding_amount)} still due`}
              color="#eb6834"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Overdue sales', count: sales.invoices.overdue_count, amount: sales.invoices.overdue_amount },
              { label: 'Overdue purchases', count: purchase.invoices.overdue_count, amount: purchase.invoices.overdue_amount },
            ].map((o) => (
              <div key={o.label} className="rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                <p className="text-xs text-slate-500">{o.label}</p>
                <p className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 tabular-nums">{rupees(o.amount)}</p>
                <p className="text-[11px] text-slate-400">
                  {o.count} invoice{o.count === 1 ? '' : 's'}
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Orders" title="Pipeline" />

        <ChartCard title="Sales orders" subtitle={`${sales.sales_orders.open_count} open`} icon={PieIcon} className="lg:col-span-4">
          <DonutChart totalLabel="orders" rows={sales.sales_orders.by_status.map((s) => ({ label: humanize(s.status), value: s.count }))} />
        </ChartCard>
        <ChartCard title="Purchase orders" subtitle={`${purchase.purchase_orders.open_count} open`} icon={PieIcon} className="lg:col-span-4" style={stagger(1)}>
          <DonutChart totalLabel="orders" rows={purchase.purchase_orders.by_status.map((s) => ({ label: humanize(s.status), value: s.count }))} />
        </ChartCard>
        <ChartCard title="Procurement flow" subtitle="From approval to goods received" icon={Workflow} className="lg:col-span-4" style={stagger(2)}>
          <ProcurementFlow summary={data} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Relationships" title="Top partners" />

        <ChartCard title="Top customers" subtitle={`By invoice value · ${data.customer_count} customers`} icon={Handshake} className="lg:col-span-6">
          <Leaderboard
            format={rupees}
            rows={sales.top_customers.map((c) => ({
              label: c.customer_name,
              value: c.total_amount,
              detail: `${c.customer_code} · ${c.invoice_count} invoice${c.invoice_count === 1 ? '' : 's'}`,
              to: `/sales-purchase/customers/${c.customer_id}`,
            }))}
          />
        </ChartCard>
        <ChartCard title="Top vendors" subtitle={`By invoice value · ${data.vendor_count} vendors`} icon={Truck} className="lg:col-span-6" style={stagger(1)}>
          <Leaderboard
            format={rupees}
            rows={purchase.top_vendors.map((v) => ({
              label: v.vendor_name,
              value: v.total_amount,
              detail: `${v.vendor_code} · ${v.invoice_count} invoice${v.invoice_count === 1 ? '' : 's'}`,
              to: `/sales-purchase/vendors/${v.vendor_id}`,
            }))}
          />
        </ChartCard>
      </div>
    </div>
  );
}
