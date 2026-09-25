import type { LucideIcon } from 'lucide-react';
import { Boxes, BedDouble, IndianRupee, RefreshCw, ShoppingCart, TrendingUp, UserCheck, Wallet, School, Bus } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import StatCard from '../../../components/data-display/StatCard';
import Button from '../../../components/ui/Button';
import LoadingState from '../../../components/feedback/LoadingState';
import ErrorState from '../../../components/feedback/ErrorState';
import { ChartCard, ColumnBars, GroupedColumns, HorizontalBars, Meter } from '../components/charts';
import AttentionList from '../components/AttentionList';
import ModuleSnapshots from '../components/ModuleSnapshots';
import type { DashboardData, DateRange } from '../types/dashboard.types';
import { compactRupees, humanize, rupees, toNumber } from '../utils/format';
import { formatDate } from '../../../utils/formatDate';

function rangeLabel(range?: DateRange): string {
  if (!range?.from && !range?.to) return 'All time';
  return `${range.from ? formatDate(range.from) : '…'} – ${range.to ? formatDate(range.to) : 'today'}`;
}

function shortDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}

function buildKpis({ sales_purchase: sp, inventory, hostel, front_office: fo, admission, canteen, transport }: DashboardData): Kpi[] {
  const kpis: (Kpi | undefined)[] = [
    sp && {
      label: 'Sales invoiced',
      value: rupees(sp.sales.invoices.period_grand_total),
      icon: TrendingUp,
      hint: `${rupees(sp.sales.invoices.outstanding_amount)} receivable`,
    },
    sp && {
      label: 'Purchases invoiced',
      value: rupees(sp.purchase.invoices.period_grand_total),
      icon: ShoppingCart,
      hint: `${rupees(sp.purchase.invoices.outstanding_amount)} payable`,
    },
    inventory && {
      label: 'Stock valuation',
      value: rupees(inventory.stock_valuation),
      icon: Boxes,
      hint: `${inventory.total_items} items tracked`,
    },
    hostel && {
      label: 'Hostel occupancy',
      value: `${hostel.occupancy.occupancy_percentage}%`,
      icon: BedDouble,
      hint: `${hostel.occupancy.occupied_places} of ${hostel.occupancy.total_capacity} places`,
    },
    fo && {
      label: 'Visitors on campus',
      value: fo.visitors.currently_checked_in,
      icon: UserCheck,
      hint: `${fo.visitors.today_visitors} checked in today`,
    },
    admission && {
      label: 'Seats available',
      value: admission.seats.available,
      icon: School,
      hint: `of ${admission.seats.total_seats} · ${admission.kpis.applications} applications`,
    },
    canteen && {
      label: 'Canteen wallet balance',
      value: rupees(canteen.total_active_wallet_balance),
      icon: Wallet,
      hint: `${canteen.total_members} members`,
    },
    transport && {
      label: 'Transport fees',
      value: rupees(transport.fee_collection_this_month),
      icon: Bus,
      hint: 'Collected this month',
    },
  ];
  return kpis.filter((k): k is Kpi => !!k);
}

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch } = useDashboard();

  if (isLoading) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message="Failed to load dashboard" onRetry={() => refetch()} />;
  if (!data) return null;

  const { sales_purchase: sp, front_office: fo, admission, hostel, inventory } = data;
  const kpis = buildKpis(data);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-600">Where the institution stands across every module</p>
        </div>
        <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {kpis.length > 0 && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <StatCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} hint={kpi.hint} />
          ))}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {sp && (
          <ChartCard
            title="Sales vs purchase"
            subtitle={`Invoice value · ${rangeLabel(sp.range)}`}
            className="lg:col-span-2"
            action={<IndianRupee className="h-5 w-5 text-slate-400" />}
          >
            <GroupedColumns
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
              height={260}
            />
          </ChartCard>
        )}

        <ChartCard title="Needs attention" subtitle="Open items across modules" className={sp ? '' : 'lg:col-span-3'}>
          <div className="max-h-[260px] overflow-y-auto">
            <AttentionList data={data} />
          </div>
        </ChartCard>
      </div>

      {sp && (
        <>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <ChartCard title="Top customers" subtitle={`By invoice value · ${sp.customer_count} customers`}>
              <HorizontalBars
                name="Invoiced"
                format={rupees}
                labelWidth={150}
                rows={sp.sales.top_customers.map((c) => ({
                  label: `${c.customer_name} · ${c.customer_code.split('/').pop()}`,
                  value: c.total_amount,
                  detail: `${c.customer_name} (${c.customer_code}) · ${c.invoice_count} invoice${c.invoice_count === 1 ? '' : 's'}`,
                }))}
              />
            </ChartCard>
            <ChartCard title="Top vendors" subtitle={`By invoice value · ${sp.vendor_count} vendors`}>
              <HorizontalBars
                name="Invoiced"
                format={rupees}
                labelWidth={150}
                rows={sp.purchase.top_vendors.map((v) => ({
                  label: `${v.vendor_name} · ${v.vendor_code.split('/').pop()}`,
                  value: v.total_amount,
                  detail: `${v.vendor_name} (${v.vendor_code}) · ${v.invoice_count} invoice${v.invoice_count === 1 ? '' : 's'}`,
                }))}
              />
            </ChartCard>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <ChartCard title="Sales orders by status" subtitle={`${sp.sales.sales_orders.open_count} open`}>
              <HorizontalBars
                name="Orders"
                labelWidth={130}
                rows={sp.sales.sales_orders.by_status.map((s) => ({ label: humanize(s.status), value: s.count }))}
              />
            </ChartCard>
            <ChartCard
              title="Purchase orders by status"
              subtitle={`${sp.purchase.purchase_orders.open_count} open · ${sp.purchase.grns.posted_count} GRNs posted`}
            >
              <HorizontalBars
                name="Orders"
                labelWidth={130}
                rows={sp.purchase.purchase_orders.by_status.map((s) => ({ label: humanize(s.status), value: s.count }))}
              />
            </ChartCard>
          </div>
        </>
      )}

      {(admission || fo) && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {admission && (
            <ChartCard
              title="Admission funnel"
              subtitle={`${admission.kpis.confirmed_admissions} confirmed · ${admission.seats.available} of ${admission.seats.total_seats} seats open`}
            >
              <HorizontalBars
                name="Candidates"
                labelWidth={130}
                rows={admission.funnel.map((f) => ({ label: humanize(f.stage), value: f.count }))}
              />
            </ChartCard>
          )}
          {fo && (
            <ChartCard
              title="Visitors by day"
              subtitle={`${fo.visitors.currently_checked_in} on campus now · ${rangeLabel(fo.range)}`}
            >
              <ColumnBars name="Visitors" rows={fo.visitors.by_day.map((d) => ({ label: shortDay(d.day), value: d.count }))} />
            </ChartCard>
          )}
        </div>
      )}

      {(hostel || inventory) && (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {hostel && (
            <ChartCard title="Hostel" subtitle={`${hostel.occupancy.residents.active} active residents · mess for ${formatDate(hostel.mess.date)}`}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Meter
                    label="Bed occupancy"
                    value={hostel.occupancy.occupied_places}
                    max={hostel.occupancy.total_capacity}
                    caption={`${hostel.occupancy.vacant_places} places vacant`}
                  />
                  <Meter
                    label="Fees collected"
                    value={toNumber(hostel.fees.total_paid)}
                    max={toNumber(hostel.fees.total_due)}
                    caption={`${rupees(toNumber(hostel.fees.outstanding))} outstanding`}
                  />
                </div>
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
                  height={200}
                />
              </div>
            </ChartCard>
          )}
          {inventory && (
            <ChartCard title="Inventory" subtitle={`${rupees(inventory.stock_valuation)} in stock · ${inventory.todays_issues} issues today`}>
              <div className="space-y-5">
                <Meter
                  label="Asset utilisation"
                  value={inventory.assets.issued}
                  max={inventory.assets.total}
                  caption={`${inventory.assets.issued} of ${inventory.assets.total} assets issued · ${inventory.assets.idle} idle`}
                />
                <div>
                  <p className="text-sm text-slate-600 mb-2">Stock by location</p>
                  <HorizontalBars
                    name="Quantity"
                    labelWidth={110}
                    rows={[...inventory.stock_by_location]
                      .sort((a, b) => b.quantity - a.quantity)
                      .map((l) => ({ label: l.location, value: l.quantity }))}
                  />
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
