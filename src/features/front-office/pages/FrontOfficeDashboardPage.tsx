import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarX,
  CheckCheck,
  CircleDot,
  Flag,
  Footprints,
  Inbox,
  MessageSquare,
  MessageSquarePlus,
  PieChart as PieIcon,
  Timer,
  UserCheck,
  UserPlus,
  UserRoundCheck,
  UserX,
  Users,
} from 'lucide-react';
import ErrorState from '../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../components/premium/AttentionList';
import { ChartCard, DonutChart, Gauge, GradientArea, GroupedColumns, Leaderboard } from '../../../components/premium/charts';
import DashboardSkeleton from '../../../components/premium/DashboardSkeleton';
import HeroAction from '../../../components/premium/HeroAction';
import KpiTile from '../../../components/premium/KpiTile';
import PageHero from '../../../components/premium/PageHero';
import SectionHeading from '../../../components/premium/SectionHeading';
import { humanize, rangeLabel } from '../../../utils/dashboardFormat';
import { getDashboardSummary } from '../api/dashboard.api';
import { getEmployees } from '../api/employees.api';
import type { FrontOfficeDashboardSummary } from '../types/dashboardRecord.types';
import { getApiErrorMessage } from '../utils/rbac.utils';

const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, (part / whole) * 100) : 0);

function formatResolutionTime(hours: number): string {
  if (!hours || hours <= 0) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

function shortDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Visitors still checked in who didn't arrive today — likely missed check-outs.
function staleCheckIns({ visitors }: FrontOfficeDashboardSummary): number {
  const stillInFromToday = Math.max(0, visitors.today_visitors - visitors.checked_out_today);
  return Math.max(0, visitors.currently_checked_in - stillInFromToday);
}

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
}

function buildKpis({ visitors, enquiries, appointments, complaints }: FrontOfficeDashboardSummary): Kpi[] {
  return [
    { label: 'On campus now', value: visitors.currently_checked_in, icon: UserCheck, hint: 'Visitors checked in', accent: '#008BE9' },
    { label: 'Visitors today', value: visitors.today_visitors, icon: Footprints, hint: `${visitors.checked_out_today} checked out`, accent: '#eb6834' },
    { label: 'Enquiries', value: enquiries.total, icon: MessageSquare, hint: `${enquiries.in_progress} in progress`, accent: '#15936a' },
    { label: 'Appointments today', value: appointments.today, icon: CalendarClock, hint: `${appointments.upcoming} upcoming`, accent: '#d55181' },
    { label: 'Appointments done', value: appointments.completed, icon: CalendarCheck, hint: `${appointments.no_show} no-show · ${appointments.cancelled} cancelled`, accent: '#4a3aa7' },
    { label: 'Complaints', value: complaints.total, icon: AlertTriangle, hint: `${complaints.open + complaints.in_progress} still open`, accent: '#7c3aed' },
    { label: 'High priority', value: complaints.critical_or_high, icon: Flag, hint: 'Critical or high complaints', accent: '#c98500' },
    { label: 'Avg. resolution', value: formatResolutionTime(complaints.average_resolution_hours), icon: Timer, hint: 'Time to resolve a complaint', accent: '#0891b2' },
  ];
}

function buildAttention(summary: FrontOfficeDashboardSummary): AttentionItem[] {
  const { enquiries, complaints, appointments } = summary;
  const items: AttentionItem[] = [
    { module: 'Enquiries', label: 'Overdue follow-ups', count: enquiries.overdue_followups, severity: 'critical', to: '/front-office/enquiries/followups' },
    { module: 'Complaints', label: 'Open complaints', count: complaints.open + complaints.in_progress, severity: 'warning', to: '/front-office/complaints' },
    { module: 'Visitors', label: 'Not checked out from earlier days', count: staleCheckIns(summary), severity: 'warning', to: '/front-office/visitors' },
    { module: 'Enquiries', label: 'Follow-ups due', count: enquiries.pending_followups, severity: 'warning', to: '/front-office/enquiries/followups' },
    { module: 'Enquiries', label: 'Open enquiries not yet picked up', count: enquiries.open, severity: 'warning', to: '/front-office/enquiries' },
    { module: 'Appointments', label: 'No-shows', count: appointments.no_show, severity: 'warning', to: '/front-office/appointments' },
  ];
  return items.filter((item) => item.count > 0);
}

// Enquiry closure and complaint resolution, pinned under the attention list.
function HealthFooter({ summary }: { summary: FrontOfficeDashboardSummary }) {
  const { enquiries, complaints } = summary;
  const bars = [
    { label: 'Enquiries closed', value: pct(enquiries.closed, enquiries.total) },
    { label: 'Complaints resolved or closed', value: pct(complaints.resolved + complaints.closed, complaints.total) },
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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

export default function FrontOfficeDashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['front-office', 'dashboard'],
    queryFn: getDashboardSummary,
  });
  // Assignees arrive as employee ids; names are a nice-to-have, so failures fall back to "#id".
  const { data: employees } = useQuery({
    queryKey: ['front-office', 'employees', 'lookup'],
    queryFn: () => getEmployees({ limit: 100 }),
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load dashboard')} onRetry={() => refetch()} />;
  if (!data) return null;

  const employeeName = (id: number) => employees?.data.find((e) => e.employee_id === id)?.name ?? `Employee #${id}`;
  const { visitors, enquiries, appointments, complaints } = data;
  const kpis = buildKpis(data);
  const attention = buildAttention(data);
  const settledAppointments = appointments.completed + appointments.cancelled + appointments.no_show;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Front office"
            title="Front office overview"
            subtitle="Visitors, enquiries, appointments and complaints at the front desk."
            highlights={[
              { icon: UserCheck, label: `${visitors.currently_checked_in} visitor${visitors.currently_checked_in === 1 ? '' : 's'} on campus` },
              { icon: MessageSquare, label: `${enquiries.in_progress} enquiries in progress` },
              { icon: CalendarClock, label: rangeLabel(data.range) },
            ]}
            actions={
              <>
                <HeroAction to="/front-office/visitors/new" icon={UserPlus} label="Check in visitor" primary />
                <HeroAction to="/front-office/enquiries/new" icon={MessageSquarePlus} label="New enquiry" />
                <HeroAction to="/front-office/appointments/new" icon={CalendarPlus} label="New appointment" />
                <HeroAction to="/front-office/complaints/new" icon={AlertTriangle} label="New complaint" />
              </>
            }
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

        <ChartCard title="Needs attention" subtitle="Follow-ups and open items at the desk" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<HealthFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Visitors" title="Who's coming in" />

        <ChartCard title="Visitors by day" subtitle={`${visitors.currently_checked_in} on campus now · ${rangeLabel(data.range)}`} icon={Footprints} className="lg:col-span-7">
          <GradientArea name="Visitors" rows={visitors.by_day.map((d) => ({ label: shortDay(d.day), value: d.count }))} />
        </ChartCard>
        <ChartCard title="Top hosts" subtitle="Staff receiving the most visitors" icon={Users} className="lg:col-span-5" style={stagger(1)}>
          <Leaderboard
            rows={[...visitors.by_host]
              .sort((a, b) => b.count - a.count)
              .map((h) => ({ label: h.host_name, value: h.count, detail: h.department }))}
          />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Enquiries" title="Enquiry pipeline" />

        <ChartCard tone="dark" title="Enquiry status" subtitle={`${enquiries.total} enquiries · ${rangeLabel(data.range)}`} icon={Inbox} className="lg:col-span-7">
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { name: 'Total', value: enquiries.total },
              { name: 'Follow-ups overdue', value: enquiries.overdue_followups },
              { name: 'Follow-ups due', value: enquiries.pending_followups },
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
              { label: 'Open', enquiries: enquiries.open },
              { label: 'In progress', enquiries: enquiries.in_progress },
              { label: 'Closed', enquiries: enquiries.closed },
            ]}
            series={[{ key: 'enquiries', name: 'Enquiries' }]}
            height={200}
            showValues
          />
        </ChartCard>
        <ChartCard title="By assignee" subtitle="Enquiries each staff member owns" icon={UserRoundCheck} className="lg:col-span-5" style={stagger(1)}>
          <Leaderboard
            rows={[...enquiries.by_assignee]
              .sort((a, b) => b.count - a.count)
              .map((a) => ({ label: employeeName(a.assigned_to), value: a.count }))}
          />
        </ChartCard>
        <ChartCard title="By category" subtitle="What people ask about" icon={PieIcon} className="lg:col-span-6">
          <DonutChart totalLabel="enquiries" rows={enquiries.by_category.map((c) => ({ label: humanize(c.category), value: c.count }))} />
        </ChartCard>
        <ChartCard title="By source" subtitle="How enquiries reach us" icon={PieIcon} className="lg:col-span-6" style={stagger(1)}>
          <DonutChart totalLabel="enquiries" rows={enquiries.by_source.map((s) => ({ label: humanize(s.source), value: s.count }))} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Appointments" title="Meetings at the desk" />

        <ChartCard title="Outcomes" subtitle={`${settledAppointments} appointments settled`} icon={CalendarCheck} className="lg:col-span-4">
          <Gauge
            label="Attended"
            value={appointments.completed}
            max={settledAppointments}
            caption={`${appointments.completed} of ${settledAppointments} completed`}
            color="#1baf7a"
          />
          <div className="mt-4">
            <MiniStats
              stats={[
                { label: 'Today', value: appointments.today, icon: CalendarClock, color: '#008BE9' },
                { label: 'Upcoming', value: appointments.upcoming, icon: CircleDot, color: '#4a3aa7' },
                { label: 'Completed', value: appointments.completed, icon: CheckCheck, color: '#15936a' },
                { label: 'Cancelled', value: appointments.cancelled, icon: CalendarX, color: '#64748b' },
                { label: 'No-show', value: appointments.no_show, icon: UserX, color: '#d55181' },
              ]}
            />
          </div>
        </ChartCard>
        <ChartCard title="By department" subtitle="Where appointments are booked" icon={Users} className="lg:col-span-4" style={stagger(1)}>
          <Leaderboard
            rows={[...appointments.by_department]
              .sort((a, b) => b.count - a.count)
              .map((d) => ({ label: d.department, value: d.count }))}
          />
        </ChartCard>
        <ChartCard title="By employee" subtitle="Staff with the most appointments" icon={UserRoundCheck} className="lg:col-span-4" style={stagger(2)}>
          <Leaderboard
            rows={[...appointments.by_employee]
              .sort((a, b) => b.count - a.count)
              .map((e) => ({ label: e.employee, value: e.count }))}
          />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Complaints" title="Issues raised" />

        <ChartCard title="Status" subtitle={`Avg. resolution ${formatResolutionTime(complaints.average_resolution_hours)}`} icon={CircleDot} className="lg:col-span-4">
          <DonutChart
            totalLabel="complaints"
            rows={[
              { label: 'Open', value: complaints.open },
              { label: 'In progress', value: complaints.in_progress },
              { label: 'Resolved', value: complaints.resolved },
              { label: 'Closed', value: complaints.closed },
            ]}
          />
        </ChartCard>
        <ChartCard title="By priority" subtitle={`${complaints.critical_or_high} critical or high`} icon={Flag} className="lg:col-span-4" style={stagger(1)}>
          <DonutChart totalLabel="complaints" rows={complaints.by_priority.map((p) => ({ label: humanize(p.priority), value: p.count }))} />
        </ChartCard>
        <ChartCard title="By category" subtitle="What complaints are about" icon={PieIcon} className="lg:col-span-4" style={stagger(2)}>
          <DonutChart totalLabel="complaints" rows={complaints.by_category.map((c) => ({ label: humanize(c.category), value: c.count }))} />
        </ChartCard>
      </div>
    </div>
  );
}
