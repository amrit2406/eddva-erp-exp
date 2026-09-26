import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  BookCopy,
  BookOpen,
  Bookmark,
  BookMarked,
  CalendarRange,
  Clock,
  Library,
  PackageCheck,
  PieChart as PieIcon,
  Repeat,
  SearchX,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../../components/premium/AttentionList';
import { ChartCard, DonutChart, EmptyChart, Gauge, GroupedColumns } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { humanize, rangeLabel, rupees } from '../../../../utils/dashboardFormat';
import { getDashboardSummary, type LibraryDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/apiError';

const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, (part / whole) * 100) : 0);

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
}

function buildKpis({ range, catalog, members, issues, reservations, fines }: LibraryDashboardSummary): Kpi[] {
  return [
    { label: 'Titles', value: catalog.total_books, icon: BookOpen, hint: `${catalog.total_copies} copies in total`, accent: '#008BE9' },
    { label: 'On the shelf', value: catalog.available_copies, icon: PackageCheck, hint: `of ${catalog.total_copies} copies`, accent: '#eb6834' },
    { label: 'Currently issued', value: issues.currently_issued, icon: Clock, hint: `${issues.overdue} overdue`, accent: '#15936a' },
    { label: 'Members', value: members.total_members, icon: Users, hint: `${members.active_members} active`, accent: '#d55181' },
    { label: 'Reservations', value: reservations.pending, icon: Bookmark, hint: `${reservations.ready_for_pickup} ready for pickup`, accent: '#4a3aa7' },
    { label: 'Issued', value: issues.issued_in_range, icon: ArrowUpFromLine, hint: `${issues.returned_in_range} returned · ${rangeLabel(range)}`, accent: '#7c3aed' },
    { label: 'Lost', value: issues.lost, icon: SearchX, hint: 'Copies marked lost', accent: '#c98500' },
    { label: 'Pending fines', value: rupees(fines.pending_total), icon: Wallet, hint: fines.pending_total > 0 ? 'To be collected' : 'No dues', accent: '#0891b2' },
  ];
}

function buildAttention({ catalog, members, issues, reservations, fines }: LibraryDashboardSummary): AttentionItem[] {
  const allCopiesOut = catalog.total_copies > 0 && catalog.available_copies === 0;
  const items: AttentionItem[] = [
    { module: 'Circulation', label: 'Overdue books', count: issues.overdue, severity: 'critical', to: '/library/issues/overdue' },
    { module: 'Circulation', label: 'Copies marked lost', count: issues.lost, severity: 'critical', to: '/library/issues' },
    { module: 'Reservations', label: 'Ready for pickup', count: reservations.ready_for_pickup, severity: 'warning', to: '/library/reservations' },
    {
      module: 'Reservations',
      label: 'Waiting with no copy free',
      count: allCopiesOut ? reservations.pending : 0,
      severity: 'warning',
      to: '/library/reservations',
    },
    {
      module: 'Catalog',
      label: 'Every copy is issued',
      count: allCopiesOut ? 1 : 0,
      detail: `0 of ${catalog.total_copies} copies on the shelf`,
      hideCount: true,
      severity: 'warning',
      to: '/library/books',
    },
    {
      module: 'Fines',
      label: 'Fines to collect',
      count: fines.pending_total > 0 ? 1 : 0,
      detail: rupees(fines.pending_total),
      hideCount: true,
      severity: 'warning',
      to: '/library/issues',
    },
    {
      module: 'Members',
      label: 'Inactive members',
      count: Math.max(0, members.total_members - members.active_members),
      severity: 'warning',
      to: '/library/members',
    },
  ];
  return items.filter((item) => item.count > 0);
}

// Shelf availability and member activity, pinned under the attention list.
function HealthFooter({ summary }: { summary: LibraryDashboardSummary }) {
  const bars = [
    { label: 'Copies on the shelf', value: pct(summary.catalog.available_copies, summary.catalog.total_copies) },
    { label: 'Active members', value: pct(summary.members.active_members, summary.members.total_members) },
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

interface MiniStat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

function MiniStats({ stats }: { stats: MiniStat[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="rounded-2xl bg-slate-50/80 px-3 py-3 ring-1 ring-slate-100">
          <Icon className="h-4 w-4" style={{ color }} />
          <p className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
          <p className="text-[11px] text-slate-500 leading-tight">{label}</p>
        </div>
      ))}
    </div>
  );
}

const statusRows = (rows: { status: string; count: number }[]) => rows.map((row) => ({ label: humanize(row.status), value: row.count }));

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['library', 'dashboard'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load dashboard')} onRetry={() => refetch()} />;
  if (!data) return null;

  const { catalog, issues, reservations, fines } = data;
  const kpis = buildKpis(data);
  const attention = buildAttention(data);
  const period = rangeLabel(data.range);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Library"
            title="Library overview"
            subtitle="The collection, what's out on loan, and who's waiting for what."
            highlights={[
              { icon: BookCopy, label: `${catalog.available_copies} of ${catalog.total_copies} copies on the shelf` },
              { icon: Clock, label: `${issues.currently_issued} on loan` },
              { icon: CalendarRange, label: period },
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

        <ChartCard title="Needs attention" subtitle="Loans, holds and dues to act on" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<HealthFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Circulation" title="Where the copies are" />

        <ChartCard tone="dark" title="Copies right now" subtitle={`${catalog.total_books} titles · ${catalog.total_copies} copies`} icon={Library} className="lg:col-span-7">
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { name: 'Copies', value: catalog.total_copies },
              { name: 'On the shelf', value: catalog.available_copies },
              { name: 'On loan', value: issues.currently_issued },
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
              { label: 'On the shelf', copies: catalog.available_copies },
              { label: 'On loan', copies: issues.currently_issued },
              { label: 'Overdue', copies: issues.overdue },
              { label: 'Lost', copies: issues.lost },
            ]}
            series={[{ key: 'copies', name: 'Copies' }]}
            height={200}
            showValues
          />
        </ChartCard>

        <ChartCard title="Issues by status" subtitle={period} icon={PieIcon} className="lg:col-span-5" style={stagger(1)}>
          <DonutChart totalLabel="issues" rows={statusRows(issues.by_status)} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Activity" title="Loans, holds & fines" />

        <ChartCard title="Loan movement" subtitle={period} icon={Repeat} className="lg:col-span-4">
          <Gauge
            label="Returned"
            value={issues.returned_in_range}
            max={issues.issued_in_range}
            caption={`${issues.returned_in_range} of ${issues.issued_in_range} issued came back`}
            color="#1baf7a"
          />
          <div className="mt-4">
            <MiniStats
              stats={[
                { label: 'Issued', value: issues.issued_in_range, icon: ArrowUpFromLine, color: '#008BE9' },
                { label: 'Returned', value: issues.returned_in_range, icon: ArrowDownToLine, color: '#15936a' },
                { label: 'On loan now', value: issues.currently_issued, icon: Clock, color: '#eb6834' },
              ]}
            />
          </div>
        </ChartCard>

        <ChartCard title="Reservations" subtitle={`${reservations.pending} pending · ${reservations.ready_for_pickup} ready`} icon={BookMarked} className="lg:col-span-4" style={stagger(1)}>
          <DonutChart totalLabel="holds" rows={statusRows(reservations.by_status)} />
        </ChartCard>

        <ChartCard title="Fines" subtitle={`${rupees(fines.pending_total)} pending`} icon={Wallet} className="lg:col-span-4" style={stagger(2)}>
          {fines.by_status_in_range.length === 0 ? (
            <EmptyChart message={`No fines · ${period}`} />
          ) : (
            <DonutChart totalLabel="fines" rows={statusRows(fines.by_status_in_range)} />
          )}
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
            <UserCheck className="h-4 w-4" style={{ color: fines.pending_total > 0 ? '#c98500' : '#15936a' }} />
            <p className="text-sm text-slate-700">{fines.pending_total > 0 ? `${rupees(fines.pending_total)} waiting to be collected` : 'No fines outstanding'}</p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
