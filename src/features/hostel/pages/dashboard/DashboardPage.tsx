import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  BedDouble,
  Bell,
  CalendarCheck,
  ClipboardCheck,
  DoorOpen,
  Hourglass,
  IndianRupee,
  LogIn,
  LogOut,
  MessageSquareWarning,
  ShieldAlert,
  Stamp,
  Timer,
  UserCheck,
  Users,
  UtensilsCrossed,
  Wrench,
  Building,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../../components/premium/AttentionList';
import { ChartCard, DonutChart, Gauge, GroupedColumns } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { humanize, rupees, toNumber } from '../../../../utils/dashboardFormat';
import { formatDate } from '../../../../utils/formatDate';
import { getDashboardSummary, type HostelDashboardSummary } from '../../api/hostel.api';
import { getApiErrorMessage } from '../../utils/errors';

const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, (part / whole) * 100) : 0);

const sum = (values: number[]) => values.reduce((total, n) => total + n, 0);

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
}

function buildKpis({ occupancy, attendance, gate, fees, complaints, mess }: HostelDashboardSummary): Kpi[] {
  return [
    { label: 'Occupancy', value: `${occupancy.occupancy_percentage}%`, icon: BedDouble, hint: `${occupancy.occupied_places} of ${occupancy.total_capacity} places`, accent: '#008BE9' },
    { label: 'Active residents', value: occupancy.residents.active, icon: Users, hint: `${occupancy.residents.total_residents} on record`, accent: '#eb6834' },
    { label: 'Rooms available', value: occupancy.rooms_available, icon: DoorOpen, hint: `${occupancy.rooms_full} full · ${occupancy.rooms_under_maintenance} in maintenance`, accent: '#15936a' },
    { label: 'Present today', value: attendance.present, icon: UserCheck, hint: `${attendance.absent} absent · ${attendance.on_leave} on leave`, accent: '#d55181' },
    { label: 'Currently out', value: gate.currently_out, icon: LogOut, hint: `${gate.expected_returns_today} due back today`, accent: '#4a3aa7' },
    { label: 'Fees outstanding', value: rupees(toNumber(fees.outstanding)), icon: IndianRupee, hint: `${fees.outstanding_invoices} unpaid invoice${fees.outstanding_invoices === 1 ? '' : 's'}`, accent: '#7c3aed' },
    { label: 'Open complaints', value: complaints.open + complaints.in_progress, icon: MessageSquareWarning, hint: `${complaints.urgent} urgent`, accent: '#c98500' },
    { label: 'Meals expected', value: mess.expected_meals, icon: UtensilsCrossed, hint: `${mess.opted_in} opted in today`, accent: '#0891b2' },
  ];
}

function buildAttention({ occupancy, gate, attendance, complaints, fees }: HostelDashboardSummary): AttentionItem[] {
  const unmarked = Object.entries(attendance.unmarked ?? {});
  const items: AttentionItem[] = [
    { module: 'Attendance', label: 'Unaccounted absences', count: attendance.unaccounted_absences, severity: 'critical', to: '/hostel/attendance' },
    { module: 'Gate', label: 'Overdue gate passes', count: gate.overdue_passes, severity: 'critical', to: '/hostel/gate-passes' },
    { module: 'Complaints', label: 'Urgent complaints', count: complaints.urgent, severity: 'critical', to: '/hostel/complaints' },
    {
      module: 'Fees',
      label: 'Overdue fee invoices',
      count: fees.overdue_invoices,
      detail: rupees(toNumber(fees.overdue_amount)),
      severity: 'critical',
      to: '/hostel/invoices',
    },
    {
      module: 'Attendance',
      label: 'Unmarked attendance',
      count: sum(unmarked.map(([, n]) => n)),
      detail: unmarked
        .filter(([, n]) => n > 0)
        .map(([session, n]) => `${n} ${session}`)
        .join(' · '),
      severity: 'warning',
      to: '/hostel/attendance/roll-call',
    },
    { module: 'Gate', label: 'Passes awaiting approval', count: gate.pending_approvals, severity: 'warning', to: '/hostel/gate-passes' },
    { module: 'Complaints', label: 'Unassigned complaints', count: complaints.unassigned, severity: 'warning', to: '/hostel/complaints' },
    {
      module: 'Fees',
      label: 'Unpaid fee invoices',
      count: fees.outstanding_invoices,
      detail: `${rupees(toNumber(fees.outstanding))} outstanding`,
      severity: 'warning',
      to: '/hostel/invoices',
    },
    { module: 'Rooms', label: 'Rooms under maintenance', count: occupancy.rooms_under_maintenance, severity: 'warning', to: '/hostel/rooms' },
    { module: 'Residents', label: 'Suspended residents', count: occupancy.residents.suspended, severity: 'warning', to: '/hostel/residents' },
  ];
  return items.filter((item) => item.count > 0);
}

// Bed occupancy and fee collection bars pinned under the attention list.
function HealthFooter({ summary }: { summary: HostelDashboardSummary }) {
  const bars = [
    { label: 'Beds occupied', value: pct(summary.occupancy.beds.occupied_beds, summary.occupancy.beds.total_beds) },
    { label: 'Fees collected', value: pct(toNumber(summary.fees.total_paid), toNumber(summary.fees.total_due)) },
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

function MiniStats({ stats, columns = 3 }: { stats: MiniStat[]; columns?: 2 | 3 }) {
  return (
    <div className={`grid gap-3 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
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

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['hostel', 'dashboard'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load dashboard')} onRetry={() => refetch()} />;
  if (!data) return null;

  const { occupancy, gate, attendance, complaints, fees, mess } = data;
  const kpis = buildKpis(data);
  const attention = buildAttention(data);
  const sessions = Object.entries(attendance.by_session ?? {});

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Hostel"
            title="Hostel overview"
            subtitle="Rooms, residents, movement and meals — where the hostel stands right now."
            highlights={[
              { icon: BedDouble, label: `${occupancy.occupancy_percentage}% occupied` },
              { icon: Users, label: `${occupancy.residents.active} active resident${occupancy.residents.active === 1 ? '' : 's'}` },
              { icon: CalendarCheck, label: `Attendance for ${formatDate(attendance.date)}` },
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

        <ChartCard title="Needs attention" subtitle="Residents, rooms and dues to act on" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<HealthFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Rooms" title="Occupancy & residents" />

        <ChartCard
          tone="dark"
          title="Occupancy"
          subtitle={`${occupancy.active_blocks} of ${occupancy.total_blocks} block${occupancy.total_blocks === 1 ? '' : 's'} active · ${occupancy.total_rooms} rooms`}
          icon={Building}
          className="lg:col-span-7"
        >
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { name: 'Total beds', value: occupancy.beds.total_beds },
              { name: 'Occupied', value: occupancy.beds.occupied_beds },
              { name: 'Vacant', value: occupancy.beds.vacant_beds },
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
              { label: 'Available', rooms: occupancy.rooms_available },
              { label: 'Full', rooms: occupancy.rooms_full },
              { label: 'Maintenance', rooms: occupancy.rooms_under_maintenance },
            ]}
            series={[{ key: 'rooms', name: 'Rooms' }]}
            height={200}
            showValues
          />
        </ChartCard>

        <ChartCard title="Residents" subtitle={`${occupancy.residents.total_residents} on record`} icon={Users} className="lg:col-span-5" style={stagger(1)}>
          <DonutChart
            totalLabel="residents"
            rows={[
              { label: 'Active', value: occupancy.residents.active },
              { label: 'Vacated', value: occupancy.residents.vacated },
              { label: 'Suspended', value: occupancy.residents.suspended },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Today" title="Attendance & movement" />

        <ChartCard title="Attendance by session" subtitle={formatDate(attendance.date)} icon={ClipboardCheck} className="lg:col-span-7">
          <GroupedColumns
            rows={sessions.map(([session, s]) => ({ label: humanize(session), present: s.present, absent: s.absent, on_leave: s.on_leave }))}
            series={[
              { key: 'present', name: 'Present' },
              { key: 'absent', name: 'Absent' },
              { key: 'on_leave', name: 'On leave' },
            ]}
            height={220}
            showValues
          />
          {Object.values(attendance.unmarked ?? {}).some((n) => n > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(attendance.unmarked)
                .filter(([, n]) => n > 0)
                .map(([session, n]) => (
                  <span key={session} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-slate-700" style={{ background: 'rgb(250 178 25 / 0.12)' }}>
                    <Hourglass className="h-3.5 w-3.5" style={{ color: '#c98500' }} />
                    {n} unmarked · {humanize(session)}
                  </span>
                ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Gate" subtitle="Outings and returns today" icon={DoorOpen} className="lg:col-span-5" style={stagger(1)}>
          <MiniStats
            stats={[
              { label: 'Currently out', value: gate.currently_out, icon: LogOut, color: '#008BE9' },
              { label: 'Due back today', value: gate.expected_returns_today, icon: Timer, color: '#4a3aa7' },
              { label: 'Overdue passes', value: gate.overdue_passes, icon: ShieldAlert, color: '#d03b3b' },
              { label: 'Outings today', value: gate.todays_outings, icon: LogOut, color: '#eb6834' },
              { label: 'Returns today', value: gate.todays_returns, icon: LogIn, color: '#15936a' },
              { label: 'To approve', value: gate.pending_approvals, icon: Stamp, color: '#c98500' },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Services" title="Mess, fees & complaints" />

        <ChartCard title="Mess today" subtitle={`${mess.expected_meals} meals expected · ${formatDate(mess.date)}`} icon={UtensilsCrossed} className="lg:col-span-7">
          <GroupedColumns
            rows={mess.by_meal.map((m) => ({ label: humanize(m.meal_type), expected: m.expected_meals, opted_in: m.opted_in, opted_out: m.opted_out }))}
            series={[
              { key: 'expected', name: 'Expected' },
              { key: 'opted_in', name: 'Opted in' },
              { key: 'opted_out', name: 'Opted out' },
            ]}
            height={220}
            showValues
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Meals consumed', value: mess.consumed },
              { label: 'Meals missed', value: mess.missed },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl bg-slate-50/80 px-4 py-3 ring-1 ring-slate-100">
                <p className="text-xs text-slate-500">{m.label}</p>
                <p className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 tabular-nums">{m.value}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Fees & complaints" subtitle={`${fees.total_invoices} invoice${fees.total_invoices === 1 ? '' : 's'} raised`} icon={IndianRupee} className="lg:col-span-5" style={stagger(1)}>
          <Gauge
            label="Fees collected"
            value={toNumber(fees.total_paid)}
            max={toNumber(fees.total_due)}
            caption={`${rupees(toNumber(fees.total_paid))} of ${rupees(toNumber(fees.total_due))} · ${rupees(toNumber(fees.outstanding))} outstanding`}
            color="#008BE9"
          />
          <p className="mt-5 mb-2 text-sm font-medium text-slate-600">Complaints</p>
          <MiniStats
            stats={[
              { label: 'Open', value: complaints.open, icon: MessageSquareWarning, color: '#eb6834' },
              { label: 'In progress', value: complaints.in_progress, icon: Wrench, color: '#008BE9' },
              { label: 'Urgent', value: complaints.urgent, icon: ShieldAlert, color: '#d03b3b' },
              { label: 'Unassigned', value: complaints.unassigned, icon: Hourglass, color: '#c98500' },
              { label: 'Resolved', value: complaints.resolved, icon: ClipboardCheck, color: '#15936a' },
              { label: 'Closed', value: complaints.closed, icon: Stamp, color: '#64748b' },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  );
}
