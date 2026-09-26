import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Bell,
  BellRing,
  Bus,
  CalendarRange,
  IdCard,
  Navigation,
  Receipt,
  Route,
  ShieldAlert,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../../components/premium/AttentionList';
import { ChartCard, DonutChart, Gauge, GroupedColumns } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import HeroAction from '../../../../components/premium/HeroAction';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { humanize, rangeLabel, rupees } from '../../../../utils/dashboardFormat';
import { getDashboardSummary, type TransportDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';

const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, (part / whole) * 100) : 0);

// Short codes like "sos" read better in capitals.
const alertLabel = (type: string) => (type.length <= 3 ? type.toUpperCase() : humanize(type));

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
}

function buildKpis({ range, fleet, drivers, passengers, fees, alerts }: TransportDashboardSummary): Kpi[] {
  const period = rangeLabel(range);
  return [
    { label: 'Active vehicles', value: fleet.active_vehicles, icon: Bus, hint: `of ${fleet.total_vehicles} in the fleet`, accent: '#008BE9' },
    { label: 'Routes', value: fleet.total_routes, icon: Route, hint: 'Configured routes', accent: '#eb6834' },
    { label: 'Active drivers', value: drivers.active, icon: IdCard, hint: `${drivers.on_leave} on leave · ${drivers.inactive} inactive`, accent: '#15936a' },
    { label: 'Passengers', value: passengers.active, icon: Users, hint: 'Active riders', accent: '#d55181' },
    { label: 'Subscriptions', value: fees.active_subscriptions, icon: Receipt, hint: `${fees.expired_subscriptions} expired`, accent: '#4a3aa7' },
    { label: 'Fees collected', value: rupees(fees.collection_in_range), icon: Wallet, hint: `${fees.payments_in_range} payment${fees.payments_in_range === 1 ? '' : 's'} · ${period}`, accent: '#7c3aed' },
    { label: 'Unresolved alerts', value: alerts.unresolved, icon: BellRing, hint: alerts.by_type.map((a) => `${a.count} ${alertLabel(a.type)}`).join(' · ') || 'None open', accent: '#c98500' },
    {
      label: 'Avg. payment',
      value: rupees(fees.payments_in_range > 0 ? Math.round(fees.collection_in_range / fees.payments_in_range) : 0),
      icon: Wallet,
      hint: 'Per fee payment',
      accent: '#0891b2',
    },
  ];
}

function buildAttention({ fleet, drivers, passengers, fees, alerts }: TransportDashboardSummary): AttentionItem[] {
  const alertItems: AttentionItem[] = alerts.by_type.map((a) => ({
    module: 'Alerts',
    label: `Unresolved ${alertLabel(a.type)} alert${a.count === 1 ? '' : 's'}`,
    count: a.count,
    severity: a.type.toLowerCase() === 'sos' ? 'critical' : 'warning',
    to: '/transport/tracking',
  }));
  const items: AttentionItem[] = [
    ...alertItems,
    { module: 'Fleet', label: 'Vehicles not active', count: Math.max(0, fleet.total_vehicles - fleet.active_vehicles), severity: 'warning', to: '/transport/vehicles' },
    {
      module: 'Fleet',
      label: 'More routes than active vehicles',
      count: fleet.total_routes > fleet.active_vehicles ? 1 : 0,
      detail: `${fleet.total_routes} routes · ${fleet.active_vehicles} vehicles`,
      hideCount: true,
      severity: 'warning',
      to: '/transport/routes',
    },
    { module: 'Drivers', label: 'Drivers on leave', count: drivers.on_leave, severity: 'warning', to: '/transport/drivers' },
    { module: 'Drivers', label: 'Inactive drivers', count: drivers.inactive, severity: 'warning', to: '/transport/drivers' },
    { module: 'Fees', label: 'Expired subscriptions', count: fees.expired_subscriptions, severity: 'warning', to: '/transport/passengers' },
    {
      module: 'Fees',
      label: 'Riders without a subscription',
      count: Math.max(0, passengers.active - fees.active_subscriptions),
      severity: 'warning',
      to: '/transport/passengers',
    },
  ];
  return items.filter((item) => item.count > 0);
}

// Fleet readiness and subscription coverage, pinned under the attention list.
function HealthFooter({ summary }: { summary: TransportDashboardSummary }) {
  const { fleet, passengers, fees } = summary;
  const bars = [
    { label: 'Vehicles active', value: pct(fleet.active_vehicles, fleet.total_vehicles) },
    { label: 'Riders with a subscription', value: pct(fees.active_subscriptions, passengers.active) },
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

function ViewAll({ to, label = 'View all', dark = false }: { to: string; label?: string; dark?: boolean }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-1 text-xs font-medium ${dark ? 'text-sky-200 hover:text-white' : 'text-brand hover:text-brand-navy'}`}>
      {label} <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['transport', 'dashboard'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load dashboard')} onRetry={() => refetch()} />;
  if (!data) return null;

  const { fleet, drivers, passengers, fees, alerts } = data;
  const kpis = buildKpis(data);
  const attention = buildAttention(data);
  const period = rangeLabel(data.range);
  const subscriptionTotal = fees.active_subscriptions + fees.expired_subscriptions;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Transport"
            title="Transport overview"
            subtitle="Fleet, crew, riders and fees — and anything on the road that needs a response."
            highlights={[
              { icon: ShieldAlert, label: alerts.unresolved === 0 ? 'No open alerts' : `${alerts.unresolved} unresolved alert${alerts.unresolved === 1 ? '' : 's'}` },
              { icon: Bus, label: `${fleet.active_vehicles} vehicle${fleet.active_vehicles === 1 ? '' : 's'} active` },
              { icon: CalendarRange, label: period },
            ]}
            actions={<HeroAction to="/transport/tracking" icon={Navigation} label="Live tracking" primary />}
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

        <ChartCard title="Needs attention" subtitle="Alerts, crew and fees to act on" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<HealthFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Fleet" title="Vehicles, routes & crew" />

        <ChartCard
          tone="dark"
          title="Fleet & crew"
          subtitle={`${fleet.total_vehicles} vehicles · ${fleet.total_routes} routes`}
          icon={Bus}
          className="lg:col-span-7"
          action={<ViewAll to="/transport/vehicles" label="Vehicles" dark />}
        >
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { name: 'Vehicles', value: fleet.total_vehicles },
              { name: 'Routes', value: fleet.total_routes },
              { name: 'Drivers', value: drivers.active + drivers.on_leave + drivers.inactive },
            ].map((s) => (
              <div key={s.name} className="rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs text-sky-100/75">{s.name}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>
          <GroupedColumns
            tone="dark"
            rows={[
              { label: 'Vehicles active', count: fleet.active_vehicles },
              { label: 'Vehicles idle', count: Math.max(0, fleet.total_vehicles - fleet.active_vehicles) },
              { label: 'Drivers active', count: drivers.active },
              { label: 'Drivers away', count: drivers.on_leave + drivers.inactive },
            ]}
            series={[{ key: 'count', name: 'Count' }]}
            height={200}
            showValues
          />
        </ChartCard>

        <ChartCard
          title="Alerts"
          subtitle={`${alerts.unresolved} unresolved`}
          icon={ShieldAlert}
          className="lg:col-span-5"
          style={stagger(1)}
          action={<ViewAll to="/transport/tracking" label="Tracking" />}
        >
          <DonutChart totalLabel="open" rows={alerts.by_type.map((a) => ({ label: alertLabel(a.type), value: a.count }))} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Riders" title="Passengers & fees" />

        <ChartCard title="Drivers by status" subtitle={`${drivers.active} on duty`} icon={IdCard} className="lg:col-span-4" action={<ViewAll to="/transport/drivers" />}>
          <DonutChart totalLabel="drivers" rows={drivers.by_status.map((d) => ({ label: humanize(d.status), value: d.count }))} />
        </ChartCard>

        <ChartCard
          title="Passengers by type"
          subtitle={`${passengers.active} active riders`}
          icon={UserCheck}
          className="lg:col-span-4"
          style={stagger(1)}
          action={<ViewAll to="/transport/passengers" />}
        >
          <DonutChart totalLabel="riders" rows={passengers.by_type.map((p) => ({ label: humanize(p.type), value: p.count }))} />
        </ChartCard>

        <ChartCard title="Fees" subtitle={period} icon={Wallet} className="lg:col-span-4" style={stagger(2)} action={<ViewAll to="/transport/fees/plans" label="Fee plans" />}>
          <Gauge
            label="Subscriptions active"
            value={fees.active_subscriptions}
            max={subscriptionTotal}
            caption={`${fees.active_subscriptions} of ${subscriptionTotal} · ${fees.expired_subscriptions} expired`}
            color="#008BE9"
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Collected', value: rupees(fees.collection_in_range), icon: Wallet, color: '#15936a' },
              { label: 'Payments', value: fees.payments_in_range, icon: Receipt, color: '#7c3aed' },
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
