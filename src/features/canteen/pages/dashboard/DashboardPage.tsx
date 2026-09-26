import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Ban,
  Banknote,
  Bell,
  CalendarRange,
  ChefHat,
  CheckCircle2,
  CreditCard,
  Hourglass,
  LayoutGrid,
  Monitor,
  Percent,
  PieChart as PieIcon,
  Receipt,
  Scale,
  Tag,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../../components/premium/AttentionList';
import { ChartCard, DonutChart, Gauge, GroupedColumns, Leaderboard } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { compactRupees, humanize, rangeLabel, rupees } from '../../../../utils/dashboardFormat';
import { getDashboardSummary, type CanteenDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';

const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, (part / whole) * 100) : 0);

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
}

function buildKpis({ today, orders, members, pos }: CanteenDashboardSummary): Kpi[] {
  return [
    { label: "Today's revenue", value: rupees(today.revenue), icon: TrendingUp, hint: `${today.order_count} orders today`, accent: '#008BE9' },
    { label: 'Net sales', value: rupees(orders.netSales), icon: Receipt, hint: `${rupees(orders.grossSales)} gross`, accent: '#eb6834' },
    { label: 'Orders', value: orders.totalOrders, icon: CheckCircle2, hint: `${orders.completedOrders} completed`, accent: '#15936a' },
    { label: 'Wallet balance', value: rupees(members.total_active_wallet_balance), icon: Wallet, hint: `${members.active_wallets} active wallets`, accent: '#d55181' },
    { label: 'Members', value: members.total_members, icon: Users, hint: `${members.active_wallets} with a wallet`, accent: '#4a3aa7' },
    { label: 'Discounts given', value: rupees(orders.discount), icon: Tag, hint: `${Math.round(pct(orders.discount, orders.grossSales))}% of gross`, accent: '#7c3aed' },
    { label: 'Tax collected', value: rupees(orders.tax), icon: Percent, hint: 'Added after discount', accent: '#c98500' },
    { label: 'POS shifts', value: pos.totalShifts, icon: Monitor, hint: `${pos.openShiftsCount} open · ${pos.closedShiftsCount} closed`, accent: '#0891b2' },
  ];
}

function buildAttention({ today, orders, pos }: CanteenDashboardSummary): AttentionItem[] {
  const items: AttentionItem[] = [
    {
      module: 'POS',
      label: 'Cash variance on shifts',
      count: pos.totalVariance !== 0 ? 1 : 0,
      detail: `${rupees(Math.abs(pos.totalVariance))} ${pos.totalVariance > 0 ? 'over' : 'short'} expected`,
      hideCount: true,
      severity: 'critical',
      to: '/canteen/pos/shifts',
    },
    { module: 'Orders', label: 'Unpaid orders today', count: today.unpaid_orders, severity: 'warning', to: '/canteen/orders' },
    { module: 'Orders', label: 'Cancelled orders', count: orders.cancelledOrders, severity: 'warning', to: '/canteen/orders' },
    { module: 'POS', label: 'Shifts still open', count: pos.openShiftsCount, severity: 'warning', to: '/canteen/pos/shifts' },
  ];
  return items.filter((item) => item.count > 0);
}

// Completion and wallet-adoption bars pinned under the attention list.
function HealthFooter({ summary }: { summary: CanteenDashboardSummary }) {
  const bars = [
    { label: 'Orders completed', value: pct(summary.orders.completedOrders, summary.orders.totalOrders) },
    { label: 'Members with a wallet', value: pct(summary.members.active_wallets, summary.members.total_members) },
  ];
  return (
    <div className="mt-4 space-y-3 rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
      {bars.map((bar) => (
        <div key={bar.label}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-medium text-slate-600">{bar.label}</span>
            <span className="font-semibold text-slate-900 tabular-nums">{Math.round(bar.value)}%</span>
          </div>
          <div
            className="mt-1.5 h-2 rounded-full bg-slate-200/70 overflow-hidden"
            role="meter"
            aria-label={bar.label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(bar.value)}
          >
            <div className="h-full rounded-full bg-gradient-to-r from-brand-navy to-brand transition-[width] duration-700 ease-out" style={{ width: `${bar.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Opening -> expected -> closing cash, with the variance called out.
function CashReconciliation({ pos }: { pos: CanteenDashboardSummary['pos'] }) {
  const balanced = pos.totalVariance === 0;
  return (
    <div className="space-y-4">
      <GroupedColumns
        rows={[
          { label: 'Opening', cash: pos.totalOpeningCash },
          { label: 'Expected', cash: pos.totalExpectedCash },
          { label: 'Closing', cash: pos.totalClosingCash },
        ]}
        series={[{ key: 'cash', name: 'Cash' }]}
        format={compactRupees}
        height={210}
        showValues
      />
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{
          background: balanced ? 'rgb(12 163 12 / 0.06)' : 'rgb(208 59 59 / 0.06)',
          boxShadow: `inset 0 0 0 1px ${balanced ? 'rgb(12 163 12 / 0.2)' : 'rgb(208 59 59 / 0.2)'}`,
        }}
      >
        <Scale className="h-5 w-5 flex-shrink-0" style={{ color: balanced ? '#0ca30c' : '#d03b3b' }} />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-900">{balanced ? 'Cash matches expected' : 'Cash variance'}</p>
          <p className="text-xs text-slate-500">
            {balanced ? 'Closing cash equals expected cash across shifts' : `Closing is ${pos.totalVariance > 0 ? 'above' : 'below'} expected across ${pos.closedShiftsCount} closed shifts`}
          </p>
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900 tabular-nums">
          {pos.totalVariance > 0 ? '+' : pos.totalVariance < 0 ? '−' : ''}
          {rupees(Math.abs(pos.totalVariance))}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['canteen', 'dashboard'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load dashboard')} onRetry={() => refetch()} />;
  if (!data) return null;

  const { today, orders, pos } = data;
  const kpis = buildKpis(data);
  const attention = buildAttention(data);
  const inProgress = Math.max(0, orders.totalOrders - orders.completedOrders - orders.cancelledOrders);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Canteen"
            title="Canteen overview"
            subtitle="Sales, menu performance, wallets and counter cash in one place."
            highlights={[
              { icon: CalendarRange, label: rangeLabel(data.range) },
              { icon: Receipt, label: `${today.order_count} order${today.order_count === 1 ? '' : 's'} today` },
              { icon: Monitor, label: pos.active_shifts === 0 ? 'No counter open' : `${pos.active_shifts} counter${pos.active_shifts === 1 ? '' : 's'} open` },
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

        <ChartCard title="Needs attention" subtitle="Orders and counters to act on" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<HealthFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Sales" title="Revenue & payments" />

        <ChartCard tone="dark" title="Sales by payment mode" subtitle={`Order value · ${rangeLabel(data.range)}`} icon={CreditCard} className="lg:col-span-7">
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { name: 'Gross', value: orders.grossSales },
              { name: 'Discount', value: orders.discount },
              { name: 'Net', value: orders.netSales },
            ].map((s) => (
              <div key={s.name} className="rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs text-sky-100/75">{s.name}</p>
                <p className="mt-1 text-lg sm:text-xl font-semibold tracking-tight tabular-nums">{rupees(s.value)}</p>
              </div>
            ))}
          </div>
          <GroupedColumns
            tone="dark"
            rows={[
              { label: 'Cash', sales: orders.cashSales },
              { label: 'UPI', sales: orders.upiSales },
              { label: 'Card', sales: orders.cardSales },
              { label: 'Wallet', sales: orders.walletSales },
            ]}
            series={[{ key: 'sales', name: 'Sales' }]}
            format={compactRupees}
            height={220}
            showValues
          />
        </ChartCard>

        <ChartCard title="Payment transactions" subtitle="Amount by mode and status" icon={PieIcon} className="lg:col-span-5" style={stagger(1)}>
          <DonutChart
            totalLabel="collected"
            format={rupees}
            rows={data.payment_summary.map((p) => ({
              label: p.status.toLowerCase() === 'success' ? p.paymentMode : `${p.paymentMode} · ${humanize(p.status)}`,
              value: p.totalAmount,
              detail: `${p.transactionCount} transaction${p.transactionCount === 1 ? '' : 's'}`,
            }))}
          />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Menu" title="What's selling" />

        <ChartCard title="Top selling items" subtitle="By sales value" icon={ChefHat} className="lg:col-span-7">
          <Leaderboard
            format={rupees}
            rows={data.top_items.map((item) => ({
              label: item.itemName,
              value: item.totalSales,
              detail: `${item.categoryName} · ${item.quantitySold} sold`,
              to: '/canteen/menu/items',
            }))}
          />
        </ChartCard>
        <ChartCard title="Sales by category" subtitle={`${data.category_sales.length} categories`} icon={LayoutGrid} className="lg:col-span-5" style={stagger(1)}>
          <DonutChart
            totalLabel="sales"
            format={rupees}
            rows={data.category_sales.map((c) => ({
              label: c.categoryName,
              value: c.totalSales,
              detail: `${c.totalItemsSold} items sold`,
            }))}
          />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Counter" title="Orders & cash" />

        <ChartCard title="Cash reconciliation" subtitle={`Across ${pos.totalShifts} POS shifts`} icon={Banknote} className="lg:col-span-7">
          <CashReconciliation pos={pos} />
        </ChartCard>

        <ChartCard title="Order outcomes" subtitle={`${orders.totalOrders} orders · ${rangeLabel(data.range)}`} icon={CheckCircle2} className="lg:col-span-5" style={stagger(1)}>
          <Gauge
            label="Completion rate"
            value={orders.completedOrders}
            max={orders.totalOrders}
            caption={`${orders.completedOrders} of ${orders.totalOrders} orders completed`}
            color="#1baf7a"
          />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Completed', value: orders.completedOrders, icon: CheckCircle2, color: '#15936a' },
              { label: 'In progress', value: inProgress, icon: Hourglass, color: '#008BE9' },
              { label: 'Cancelled', value: orders.cancelledOrders, icon: Ban, color: '#d55181' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl bg-slate-50/80 px-3 py-3 ring-1 ring-slate-100">
                <Icon className="h-4 w-4" style={{ color }} />
                <p className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
                <p className="text-[11px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
