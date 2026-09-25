import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BedDouble,
  Bell,
  Boxes,
  Bus,
  Filter,
  Footprints,
  Handshake,
  PieChart as PieIcon,
  School,
  ShoppingCart,
  TrendingUp,
  Truck,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import ErrorState from '../../../components/feedback/ErrorState';
import { ChartCard, DonutChart, Funnel, Gauge, GradientArea, GroupedColumns, Leaderboard, StockTreemap } from '../components/charts';
import AttentionList from '../components/AttentionList';
import DashboardSkeleton from '../components/DashboardSkeleton';
import HeroBanner from '../components/HeroBanner';
import KpiTile from '../components/KpiTile';
import ModuleSnapshots from '../components/ModuleSnapshots';
import type { DashboardData, DateRange } from '../types/dashboard.types';
import { collectAttentionItems } from '../utils/attention';
import { compactRupees, humanize, rupees, toNumber } from '../utils/format';
import { formatDate } from '../../../utils/formatDate';

function rangeLabel(range?: DateRange): string {
  if (!range?.from && !range?.to) return 'All time';
  return `${range.from ? formatDate(range.from) : '…'} – ${range.to ? formatDate(range.to) : 'today'}`;
}

function shortDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Entrance stagger — capped so late cards don't wait noticeably.
const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

// Bento pairs: when a partner card is missing, the survivor takes the full row.
const span = (partnerPresent: unknown, cols: string) => (partnerPresent ? cols : 'lg:col-span-12');

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="lg:col-span-12 pt-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
    </div>
  );
}

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
}

function buildKpis({ sales_purchase: sp, inventory, hostel, front_office: fo, admission, canteen, transport }: DashboardData): Kpi[] {
  const kpis: (Kpi | undefined)[] = [
    sp && {
      label: 'Sales invoiced',
      value: rupees(sp.sales.invoices.period_grand_total),
      icon: TrendingUp,
      hint: `${rupees(sp.sales.invoices.outstanding_amount)} receivable`,
      accent: '#008BE9',
    },
    sp && {
      label: 'Purchases invoiced',
      value: rupees(sp.purchase.invoices.period_grand_total),
      icon: ShoppingCart,
      hint: `${rupees(sp.purchase.invoices.outstanding_amount)} payable`,
      accent: '#eb6834',
    },
    inventory && {
      label: 'Stock valuation',
      value: rupees(inventory.stock_valuation),
      icon: Boxes,
      hint: `${inventory.total_items} items tracked`,
      accent: '#15936a',
    },
    hostel && {
      label: 'Hostel occupancy',
      value: `${hostel.occupancy.occupancy_percentage}%`,
      icon: BedDouble,
      hint: `${hostel.occupancy.occupied_places} of ${hostel.occupancy.total_capacity} places`,
      accent: '#d55181',
    },
    fo && {
      label: 'Visitors on campus',
      value: fo.visitors.currently_checked_in,
      icon: UserCheck,
      hint: `${fo.visitors.today_visitors} checked in today`,
      accent: '#7c3aed',
    },
    admission && {
      label: 'Seats available',
      value: admission.seats.available,
      icon: School,
      hint: `of ${admission.seats.total_seats} · ${admission.kpis.applications} applied`,
      accent: '#4a3aa7',
    },
    canteen && {
      label: 'Canteen wallets',
      value: rupees(canteen.total_active_wallet_balance),
      icon: Wallet,
      hint: `${canteen.total_members} members`,
      accent: '#c98500',
    },
    transport && {
      label: 'Transport fees',
      value: rupees(transport.fee_collection_this_month),
      icon: Bus,
      hint: 'Collected this month',
      accent: '#0891b2',
    },
  ];
  return kpis.filter((k): k is Kpi => !!k);
}

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message="Failed to load dashboard" onRetry={() => refetch()} />;
  if (!data) return null;

  const { sales_purchase: sp, front_office: fo, admission, hostel, inventory, accounts } = data;
  const kpis = buildKpis(data);
  const attention = collectAttentionItems(data);

  return (
    <div className="space-y-8">
      {/* Bento: hero + KPIs on the left, a tall attention rail on the right. */}
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <HeroBanner
            attentionCount={attention.length}
            financialYear={accounts?.open_financial_year?.fyLabel}
            visitorsOnCampus={fo?.visitors.currently_checked_in}
            updatedAt={dataUpdatedAt}
            refreshing={isFetching}
            onRefresh={() => refetch()}
          />
          {kpis.length > 0 && (
            <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
              {kpis.map((kpi, index) => (
                <KpiTile key={kpi.label} {...kpi} style={stagger(index)} />
              ))}
            </div>
          )}
        </div>

        <ChartCard title="Needs attention" subtitle="Open items across modules" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} moduleCount={Object.values(data).filter(Boolean).length} />
        </ChartCard>
      </div>

      {sp && (
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
          <SectionHeading eyebrow="Commerce" title="Sales & purchase" />

          <ChartCard
            tone="dark"
            title="Sales vs purchase"
            subtitle={`Invoice value · ${rangeLabel(sp.range)}`}
            icon={BarChart3}
            className="lg:col-span-7"
          >
            <div className="mb-4 grid grid-cols-2 gap-3">
              {[
                { name: 'Sales', total: sp.sales.invoices.period_grand_total, count: sp.sales.invoices.period_count, color: '#1f8fe6' },
                { name: 'Purchase', total: sp.purchase.invoices.period_grand_total, count: sp.purchase.invoices.period_count, color: '#e66a36' },
              ].map((s) => (
                <div key={s.name} className="rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                  <p className="flex items-center gap-1.5 text-xs text-sky-100/75">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                    {s.name}
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{rupees(s.total)}</p>
                  <p className="text-[11px] text-sky-100/60">{s.count} invoices</p>
                </div>
              ))}
            </div>
            <GroupedColumns
              tone="dark"
              rows={[
                { label: 'Invoiced', sales: sp.sales.invoices.period_grand_total, purchase: sp.purchase.invoices.period_grand_total },
                { label: 'Tax', sales: sp.sales.invoices.period_tax, purchase: sp.purchase.invoices.period_tax },
                { label: 'Outstanding', sales: sp.sales.invoices.outstanding_amount, purchase: sp.purchase.invoices.outstanding_amount },
                { label: 'Overdue', sales: sp.sales.invoices.overdue_amount, purchase: sp.purchase.invoices.overdue_amount },
              ]}
              series={[
                { key: 'sales', name: 'Sales' },
                { key: 'purchase', name: 'Purchase' },
              ]}
              format={compactRupees}
              height={230}
            />
          </ChartCard>

          <ChartCard title="Orders by status" subtitle="Sales and purchase orders" icon={PieIcon} className="lg:col-span-5" style={stagger(1)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Sales</p>
                <DonutChart
                  totalLabel="orders"
                  rows={sp.sales.sales_orders.by_status.map((s) => ({ label: humanize(s.status), value: s.count }))}
                />
              </div>
              <div>
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Purchase</p>
                <DonutChart
                  totalLabel="orders"
                  rows={sp.purchase.purchase_orders.by_status.map((s) => ({ label: humanize(s.status), value: s.count }))}
                />
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Top customers" subtitle={`By invoice value · ${sp.customer_count} customers`} icon={Handshake} className={span(admission, 'lg:col-span-4')}>
            <Leaderboard
              format={rupees}
              rows={sp.sales.top_customers.map((c) => ({
                label: c.customer_name,
                value: c.total_amount,
                detail: `${c.customer_code} · ${c.invoice_count} invoice${c.invoice_count === 1 ? '' : 's'}`,
              }))}
            />
          </ChartCard>
          <ChartCard title="Top vendors" subtitle={`By invoice value · ${sp.vendor_count} vendors`} icon={Truck} className={span(admission, 'lg:col-span-4')} style={stagger(1)}>
            <Leaderboard
              format={rupees}
              rows={sp.purchase.top_vendors.map((v) => ({
                label: v.vendor_name,
                value: v.total_amount,
                detail: `${v.vendor_code} · ${v.invoice_count} invoice${v.invoice_count === 1 ? '' : 's'}`,
              }))}
            />
          </ChartCard>
          {admission && (
            <ChartCard
              title="Admission funnel"
              subtitle={`${admission.kpis.confirmed_admissions} confirmed · ${admission.seats.available} seats open`}
              icon={Filter}
              className="lg:col-span-4"
              style={stagger(2)}
            >
              <Funnel rows={admission.funnel.map((f) => ({ label: humanize(f.stage), value: f.count }))} />
            </ChartCard>
          )}
        </div>
      )}

      {(fo || hostel || inventory || (admission && !sp)) && (
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
          <SectionHeading eyebrow="Campus" title="People & facilities" />

          {admission && !sp && (
            <ChartCard
              title="Admission funnel"
              subtitle={`${admission.kpis.confirmed_admissions} confirmed · ${admission.seats.available} seats open`}
              icon={Filter}
              className="lg:col-span-12"
            >
              <Funnel rows={admission.funnel.map((f) => ({ label: humanize(f.stage), value: f.count }))} />
            </ChartCard>
          )}

          {fo && (
            <ChartCard
              title="Visitors by day"
              subtitle={`${fo.visitors.currently_checked_in} on campus now · ${rangeLabel(fo.range)}`}
              icon={Footprints}
              className={span(hostel, 'lg:col-span-5')}
            >
              <GradientArea name="Visitors" rows={fo.visitors.by_day.map((d) => ({ label: shortDay(d.day), value: d.count }))} />
            </ChartCard>
          )}
          {hostel && (
            <ChartCard
              title="Hostel"
              subtitle={`${hostel.occupancy.residents.active} active residents · mess for ${formatDate(hostel.mess.date)}`}
              icon={BedDouble}
              className={span(fo, 'lg:col-span-7')}
              style={stagger(1)}
            >
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5 items-start">
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
                  <Gauge
                    label="Bed occupancy"
                    value={hostel.occupancy.occupied_places}
                    max={hostel.occupancy.total_capacity}
                    caption={`${hostel.occupancy.vacant_places} places vacant`}
                    color="#d55181"
                  />
                  <Gauge
                    label="Fees collected"
                    value={toNumber(hostel.fees.total_paid)}
                    max={toNumber(hostel.fees.total_due)}
                    caption={`${rupees(toNumber(hostel.fees.outstanding))} outstanding`}
                    color="#008BE9"
                  />
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-slate-600">Mess today</p>
                  <GroupedColumns
                    rows={hostel.mess.by_meal.map((m) => ({
                      label: humanize(m.meal_type),
                      expected: m.expected_meals,
                      opted_in: m.opted_in,
                      opted_out: m.opted_out,
                    }))}
                    series={[
                      { key: 'expected', name: 'Expected' },
                      { key: 'opted_in', name: 'Opted in' },
                      { key: 'opted_out', name: 'Opted out' },
                    ]}
                    height={260}
                    showValues
                  />
                </div>
              </div>
            </ChartCard>
          )}

          {inventory && (
            <ChartCard
              title="Inventory"
              subtitle={`${rupees(inventory.stock_valuation)} in stock · ${inventory.todays_issues} issues today · ${inventory.overdue_returns} overdue returns`}
              icon={Boxes}
              className="lg:col-span-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-5">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-600">Stock by location</p>
                  <StockTreemap
                    rows={[...inventory.stock_by_location]
                      .sort((a, b) => b.quantity - a.quantity)
                      .map((l) => ({ label: l.location, value: l.quantity }))}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Gauge
                    label="Asset utilisation"
                    value={inventory.assets.issued}
                    max={inventory.assets.total}
                    caption={`${inventory.assets.issued} of ${inventory.assets.total} issued · ${inventory.assets.idle} idle`}
                    color="#15936a"
                  />
                  <div className="rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                    <p className="text-xs text-slate-500">Low-stock items</p>
                    <p className="text-xl font-semibold tracking-tight text-slate-900 tabular-nums">{inventory.low_stock_items}</p>
                  </div>
                </div>
              </div>
            </ChartCard>
          )}
        </div>
      )}

      <ModuleSnapshots data={data} />
    </div>
  );
}
