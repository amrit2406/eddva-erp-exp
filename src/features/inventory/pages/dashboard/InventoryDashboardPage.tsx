import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Bell,
  BellRing,
  Boxes,
  CalendarRange,
  ClipboardCheck,
  Clock,
  Folder,
  Gauge as GaugeIcon,
  IndianRupee,
  MapPin,
  Package,
  PackageSearch,
  ShoppingCart,
  Truck,
  X,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../../components/premium/AttentionList';
import { ChartCard, DonutChart, Gauge, GroupedColumns, Leaderboard, StockTreemap } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import HeroAction from '../../../../components/premium/HeroAction';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { compactRupees, humanize, rangeLabel, rupees } from '../../../../utils/dashboardFormat';
import { getDashboardSummary } from '../../api/dashboard.api';
import type { InventoryDashboardSummary } from '../../types/dashboard.types';
import { getApiErrorMessage } from '../../utils/errors';

const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, (part / whole) * 100) : 0);

const assetCount = (summary: InventoryDashboardSummary, status: string) => summary.assets.by_status.find((s) => s.status === status)?.count ?? 0;

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
}

function buildKpis(summary: InventoryDashboardSummary): Kpi[] {
  const units = summary.stock_by_location.reduce((sum, l) => sum + l.quantity, 0);
  const spend = summary.vendor_wise_purchases.reduce((sum, v) => sum + v.total_amount, 0);
  const purchases = summary.vendor_wise_purchases.reduce((sum, v) => sum + v.purchase_count, 0);
  return [
    { label: 'Stock value', value: rupees(summary.stock_valuation), icon: IndianRupee, hint: 'Current valuation', accent: '#008BE9' },
    { label: 'Items tracked', value: summary.total_items, icon: Package, hint: `${summary.low_stock_items} low on stock`, accent: '#eb6834' },
    { label: 'Units in stock', value: units, icon: Boxes, hint: `Across ${summary.stock_by_location.length} locations`, accent: '#15936a' },
    { label: 'Issues today', value: summary.todays_issues, icon: ClipboardCheck, hint: 'Items handed out', accent: '#d55181' },
    { label: 'Overdue returns', value: summary.overdue_returns, icon: Clock, hint: 'Past their return date', accent: '#4a3aa7' },
    { label: 'Assets', value: summary.assets.total, icon: PackageSearch, hint: `${summary.assets.issued} issued · ${summary.assets.idle} idle`, accent: '#7c3aed' },
    { label: 'Asset utilisation', value: `${summary.assets.utilization_pct}%`, icon: GaugeIcon, hint: 'Share of assets in use', accent: '#c98500' },
    { label: 'Purchases', value: rupees(spend), icon: ShoppingCart, hint: `${purchases} orders · ${summary.vendor_wise_purchases.length} vendors`, accent: '#0891b2' },
  ];
}

function buildAttention(summary: InventoryDashboardSummary): AttentionItem[] {
  const { assets } = summary;
  const items: AttentionItem[] = [
    { module: 'Issues', label: 'Overdue returns', count: summary.overdue_returns, severity: 'critical', to: '/inventory/alerts' },
    { module: 'Assets', label: 'Assets marked lost', count: assetCount(summary, 'lost'), severity: 'critical', to: '/inventory/assets' },
    { module: 'Stock', label: 'Items low on stock', count: summary.low_stock_items, severity: 'warning', to: '/inventory/alerts' },
    { module: 'Assets', label: 'Assets under repair', count: assetCount(summary, 'under_repair'), severity: 'warning', to: '/inventory/maintenance' },
    {
      module: 'Assets',
      label: 'Most assets sitting idle',
      count: assets.total > 0 && assets.utilization_pct < 25 ? 1 : 0,
      detail: `${assets.idle} of ${assets.total} not in use`,
      hideCount: true,
      severity: 'warning',
      to: '/inventory/assets',
    },
  ];
  return items.filter((item) => item.count > 0);
}

// Stock health and asset use, pinned under the attention list.
function HealthFooter({ summary }: { summary: InventoryDashboardSummary }) {
  const bars = [
    { label: 'Items above reorder level', value: pct(summary.total_items - summary.low_stock_items, summary.total_items) },
    { label: 'Assets in use', value: summary.assets.utilization_pct },
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

// Glass date inputs that live in the hero and filter the whole summary.
function PeriodFilter({ from, to, onFrom, onTo }: { from: string; to: string; onFrom: (v: string) => void; onTo: (v: string) => void }) {
  const inputClass =
    'rounded-xl bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/25 backdrop-blur-sm [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-white';
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-xs text-sky-100/80">
        From
        <input type="date" value={from} max={to || undefined} onChange={(e) => onFrom(e.target.value)} className={inputClass} />
      </label>
      <label className="flex items-center gap-2 text-xs text-sky-100/80">
        To
        <input type="date" value={to} min={from || undefined} onChange={(e) => onTo(e.target.value)} className={inputClass} />
      </label>
      {(from || to) && (
        <button
          type="button"
          onClick={() => {
            onFrom('');
            onTo('');
          }}
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-medium text-sky-100 hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  );
}

function ViewAll({ to, dark = false }: { to: string; dark?: boolean }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-1 text-xs font-medium ${dark ? 'text-sky-200 hover:text-white' : 'text-brand hover:text-brand-navy'}`}>
      View all <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export default function InventoryDashboardPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['inventory', 'dashboard', from, to],
    queryFn: () => getDashboardSummary({ from: from || undefined, to: to || undefined }),
    // Keep the current numbers on screen while a new period loads.
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error && !data) return <ErrorState message={getApiErrorMessage(error, 'Failed to load dashboard')} onRetry={() => refetch()} />;
  if (!data) return null;

  const { assets } = data;
  const kpis = buildKpis(data);
  const attention = buildAttention(data);
  const period = rangeLabel(data.range);
  const spend = data.vendor_wise_purchases.reduce((sum, v) => sum + v.total_amount, 0);
  const orders = data.vendor_wise_purchases.reduce((sum, v) => sum + v.purchase_count, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Inventory"
            title="Inventory overview"
            subtitle="Stock levels, issues, assets and spend — filter by period to compare."
            highlights={[
              { icon: IndianRupee, label: `${rupees(data.stock_valuation)} in stock` },
              { icon: GaugeIcon, label: `${assets.utilization_pct}% of assets in use` },
              { icon: CalendarRange, label: period },
            ]}
            actions={
              <>
                <PeriodFilter from={from} to={to} onFrom={setFrom} onTo={setTo} />
                <HeroAction to="/inventory/alerts" icon={BellRing} label="View alerts" primary />
              </>
            }
            updatedAt={dataUpdatedAt}
            refreshing={isFetching}
            onRefresh={() => refetch()}
          />
          <div className={`grid gap-4 grid-cols-2 xl:grid-cols-4 transition-opacity ${isFetching ? 'opacity-70' : ''}`}>
            {kpis.map((kpi, index) => (
              <KpiTile key={kpi.label} {...kpi} style={stagger(index)} />
            ))}
          </div>
        </div>

        <ChartCard title="Needs attention" subtitle="Stock and assets to act on" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<HealthFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Stock" title="Where things are" />

        <ChartCard
          title="Stock by location"
          subtitle={`${data.stock_by_location.reduce((sum, l) => sum + l.quantity, 0)} units · bigger block, more stock`}
          icon={MapPin}
          className="lg:col-span-7"
          action={<ViewAll to="/inventory/stock/balances" />}
        >
          <StockTreemap
            rows={[...data.stock_by_location].sort((a, b) => b.quantity - a.quantity).map((l) => ({ label: l.location, value: l.quantity }))}
            height={260}
          />
        </ChartCard>

        <ChartCard title="Assets" subtitle={`${assets.total} tracked`} icon={PackageSearch} className="lg:col-span-5" style={stagger(1)} action={<ViewAll to="/inventory/assets" />}>
          <Gauge label="In use" value={assets.issued} max={assets.total} caption={`${assets.issued} issued · ${assets.idle} idle`} color="#7c3aed" />
          <div className="mt-4">
            <DonutChart totalLabel="assets" rows={assets.by_status.map((s) => ({ label: humanize(s.status), value: s.count }))} />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Spend & usage" title="Purchases and consumption" />

        <ChartCard
          tone="dark"
          title="Purchases by vendor"
          subtitle={`Purchase value · ${period}`}
          icon={Truck}
          className="lg:col-span-7"
          action={<ViewAll to="/inventory/stock/purchases" dark />}
        >
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { name: 'Total spend', value: rupees(spend) },
              { name: 'Purchase orders', value: orders.toLocaleString('en-IN') },
              { name: 'Vendors', value: data.vendor_wise_purchases.length.toLocaleString('en-IN') },
            ].map((s) => (
              <div key={s.name} className="rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs text-sky-100/75">{s.name}</p>
                <p className="mt-1 text-lg sm:text-xl font-semibold tracking-tight tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
          <GroupedColumns
            tone="dark"
            rows={[...data.vendor_wise_purchases]
              .sort((a, b) => b.total_amount - a.total_amount)
              .map((v) => ({ label: v.vendor, spend: v.total_amount }))}
            series={[{ key: 'spend', name: 'Spend' }]}
            format={compactRupees}
            height={210}
            showValues
          />
        </ChartCard>

        <ChartCard
          title="Consumption by category"
          subtitle={`Issues · ${period}`}
          icon={Folder}
          className="lg:col-span-5"
          style={stagger(1)}
          action={<ViewAll to="/inventory/categories" />}
        >
          <Leaderboard
            rows={[...data.category_wise_consumption]
              .sort((a, b) => b.issue_count - a.issue_count)
              .map((c) => ({ label: c.category, value: c.issue_count }))}
          />
        </ChartCard>
      </div>
    </div>
  );
}
