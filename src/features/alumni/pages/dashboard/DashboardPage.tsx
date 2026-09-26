import { useEffect, useState, type CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Briefcase,
  CalendarDays,
  GraduationCap,
  HandHeart,
  Handshake,
  Hourglass,
  Layers,
  Mail,
  Megaphone,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../../components/premium/AttentionList';
import { ChartCard, Gauge, GroupedColumns } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { rupees } from '../../../../utils/dashboardFormat';
import ReportData from '../../components/reports/ReportData';
import {
  getDashboardCommunication,
  getDashboardDirectory,
  getDashboardDonations,
  getDashboardEvents,
  getDashboardJobs,
  getDashboardMentorship,
  getDashboardSummary,
  type AlumniDashboardSummary,
} from '../../api/dashboard.api';
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

function buildKpis({ alumni, events, jobs, mentorship, donations, communication }: AlumniDashboardSummary): Kpi[] {
  return [
    { label: 'Alumni', value: alumni.total, icon: GraduationCap, hint: `${alumni.verified} verified`, accent: '#008BE9' },
    { label: 'Upcoming events', value: events.upcoming, icon: CalendarDays, hint: `${events.registrations_for_upcoming} registered`, accent: '#eb6834' },
    { label: 'Open jobs', value: jobs.open, icon: Briefcase, hint: `${jobs.applications} applications`, accent: '#15936a' },
    { label: 'Hired', value: jobs.hired, icon: UserCheck, hint: 'Through the job board', accent: '#d55181' },
    { label: 'Available mentors', value: mentorship.available_mentors, icon: Sparkles, hint: `${mentorship.active_programs} active programs`, accent: '#4a3aa7' },
    { label: 'Active matches', value: mentorship.active_matches, icon: Handshake, hint: 'Mentor–mentee pairs', accent: '#7c3aed' },
    { label: 'Donations', value: rupees(donations.total), icon: HandHeart, hint: `${donations.donors} donors · ${donations.active_campaigns} campaigns`, accent: '#c98500' },
    { label: 'Newsletters sent', value: communication.newsletters_sent, icon: Mail, hint: `${communication.failed_deliveries} failed deliveries`, accent: '#0891b2' },
  ];
}

function buildAttention({ alumni, mentorship, donations, communication }: AlumniDashboardSummary): AttentionItem[] {
  const items: AttentionItem[] = [
    { module: 'Communication', label: 'Failed newsletter deliveries', count: communication.failed_deliveries, severity: 'critical', to: '/alumni/communication-logs' },
    { module: 'Directory', label: 'Profiles to verify', count: alumni.pending_verification, severity: 'warning', to: '/alumni/profiles' },
    {
      module: 'Mentorship',
      label: 'Programs running with no matches',
      count: mentorship.active_programs > 0 && mentorship.active_matches === 0 ? 1 : 0,
      detail: `${mentorship.available_mentors} mentor${mentorship.available_mentors === 1 ? '' : 's'} available`,
      hideCount: true,
      severity: 'warning',
      to: '/alumni/mentorship-matches',
    },
    {
      module: 'Donations',
      label: 'Campaigns with no donations yet',
      count: donations.active_campaigns > 0 && donations.total === 0 ? 1 : 0,
      detail: `${donations.active_campaigns} active campaign${donations.active_campaigns === 1 ? '' : 's'}`,
      hideCount: true,
      severity: 'warning',
      to: '/alumni/campaigns',
    },
  ];
  return items.filter((item) => item.count > 0);
}

// Verification and hiring rates pinned under the attention list.
function HealthFooter({ summary }: { summary: AlumniDashboardSummary }) {
  const bars = [
    { label: 'Profiles verified', value: pct(summary.alumni.verified, summary.alumni.total) },
    { label: 'Job applications hired', value: pct(summary.jobs.hired, summary.jobs.applications) },
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

interface ProgramCardProps {
  title: string;
  icon: LucideIcon;
  accent: string;
  to: string;
  stats: [string, string | number][];
  className?: string;
  style?: CSSProperties;
}

// One alumni program with its headline numbers; the whole card links to it.
function ProgramCard({ title, icon: Icon, accent, to, stats, className = '', style }: ProgramCardProps) {
  return (
    <Link
      to={to}
      className={`animate-rise group relative flex flex-col overflow-hidden rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${className}`}
      style={style}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(180deg, ${accent}1f, transparent)` }}
      />
      <div className="relative flex items-center gap-3 mb-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}b3)`, boxShadow: `0 8px 18px -8px ${accent}` }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="font-semibold tracking-tight text-slate-900">{title}</h3>
        <ArrowUpRight className="ml-auto h-4 w-4 text-slate-300 transition-all group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <dl className={`relative grid gap-2 ${stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-slate-50/90 px-3 py-2 ring-1 ring-slate-100">
            <dt className="text-[11px] text-slate-500 truncate">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-slate-900 tabular-nums truncate">{value}</dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}

type Tab = 'directory' | 'events' | 'jobs' | 'mentorship' | 'donations' | 'communication';

const TABS: { key: Tab; label: string; load: () => Promise<unknown> }[] = [
  { key: 'directory', label: 'Directory', load: getDashboardDirectory },
  { key: 'events', label: 'Events', load: getDashboardEvents },
  { key: 'jobs', label: 'Jobs', load: getDashboardJobs },
  { key: 'mentorship', label: 'Mentorship', load: getDashboardMentorship },
  { key: 'donations', label: 'Donations', load: getDashboardDonations },
  { key: 'communication', label: 'Communication', load: getDashboardCommunication },
];

interface SectionState {
  key: Tab;
  data?: unknown;
  error?: string;
}

// Per-program breakdowns, each loaded from its own endpoint when its tab opens.
function DetailTabs() {
  const [tab, setTab] = useState<Tab>('directory');
  const [section, setSection] = useState<SectionState | null>(null);

  useEffect(() => {
    const current = TABS.find((t) => t.key === tab)!;
    let cancelled = false;
    current
      .load()
      .then((data) => {
        if (!cancelled) setSection({ key: tab, data });
      })
      .catch((err) => {
        if (!cancelled) setSection({ key: tab, error: getApiErrorMessage(err, `Failed to load ${current.label.toLowerCase()}`) });
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  return (
    <ChartCard title="Program breakdowns" subtitle="Detailed figures for each alumni program" icon={Layers} className="lg:col-span-12">
      <div className="mb-5 flex gap-1.5 overflow-x-auto rounded-2xl bg-slate-100/80 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white text-brand-navy shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {!section || section.key !== tab ? (
        <div className="space-y-3">
          <div className="skeleton h-10 rounded-xl" />
          <div className="skeleton h-10 rounded-xl" />
          <div className="skeleton h-10 rounded-xl" />
        </div>
      ) : section.error ? (
        <div className="text-center text-red-500 py-8">{section.error}</div>
      ) : (
        <ReportData key={tab} data={section.data} />
      )}
    </ChartCard>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['alumni', 'dashboard'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load summary')} onRetry={() => refetch()} />;
  if (!data) return null;

  const { alumni, events, jobs, mentorship, donations, communication } = data;
  const kpis = buildKpis(data);
  const attention = buildAttention(data);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Alumni"
            title="Alumni network"
            subtitle="Community, careers, mentorship and giving — how the network is engaging."
            highlights={[
              { icon: GraduationCap, label: `${alumni.total} alumni` },
              { icon: CalendarDays, label: `${events.upcoming} upcoming event${events.upcoming === 1 ? '' : 's'}` },
              { icon: Briefcase, label: `${jobs.open} open job${jobs.open === 1 ? '' : 's'}` },
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

        <ChartCard title="Needs attention" subtitle="Profiles and programs to follow up" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<HealthFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Community" title="Engagement" />

        <ChartCard tone="dark" title="People engaged" subtitle="Participation across alumni programs" icon={Users} className="lg:col-span-7">
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { name: 'Alumni', value: alumni.total },
              { name: 'Verified', value: alumni.verified },
              { name: 'Donors', value: donations.donors },
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
              { label: 'Event sign-ups', people: events.registrations_for_upcoming },
              { label: 'Job applicants', people: jobs.applications },
              { label: 'Mentor matches', people: mentorship.active_matches },
              { label: 'Donors', people: donations.donors },
            ]}
            series={[{ key: 'people', name: 'People' }]}
            height={210}
            showValues
          />
        </ChartCard>

        <ChartCard title="Verification" subtitle="Alumni profiles checked by the office" icon={BadgeCheck} className="lg:col-span-5" style={stagger(1)}>
          <Gauge
            label="Profiles verified"
            value={alumni.verified}
            max={alumni.total}
            caption={`${alumni.verified} of ${alumni.total} alumni`}
            color="#008BE9"
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Verified', value: alumni.verified, icon: BadgeCheck, color: '#15936a' },
              { label: 'Awaiting verification', value: alumni.pending_verification, icon: Hourglass, color: '#c98500' },
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

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Programs" title="What the network is doing" />

        <ProgramCard
          title="Events"
          icon={Ticket}
          accent="#eb6834"
          to="/alumni/events"
          className="lg:col-span-4"
          stats={[
            ['Upcoming', events.upcoming],
            ['Registrations', events.registrations_for_upcoming],
            ['Revenue', rupees(events.revenue)],
          ]}
        />
        <ProgramCard
          title="Jobs"
          icon={Briefcase}
          accent="#15936a"
          to="/alumni/jobs"
          className="lg:col-span-4"
          style={stagger(1)}
          stats={[
            ['Open', jobs.open],
            ['Applications', jobs.applications],
            ['Hired', jobs.hired],
          ]}
        />
        <ProgramCard
          title="Mentorship"
          icon={Sparkles}
          accent="#4a3aa7"
          to="/alumni/mentorship-programs"
          className="lg:col-span-4"
          style={stagger(2)}
          stats={[
            ['Programs', mentorship.active_programs],
            ['Mentors', mentorship.available_mentors],
            ['Matches', mentorship.active_matches],
          ]}
        />
        <ProgramCard
          title="Donations"
          icon={HandHeart}
          accent="#c98500"
          to="/alumni/campaigns"
          className="lg:col-span-6"
          stats={[
            ['Campaigns', donations.active_campaigns],
            ['Raised', rupees(donations.total)],
            ['Donors', donations.donors],
          ]}
        />
        <ProgramCard
          title="Communication"
          icon={Megaphone}
          accent="#0891b2"
          to="/alumni/newsletters"
          className="lg:col-span-6"
          style={stagger(1)}
          stats={[
            ['Newsletters sent', communication.newsletters_sent],
            ['Failed deliveries', communication.failed_deliveries],
          ]}
        />
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Details" title="Dig deeper" />
        <DetailTabs />
      </div>
    </div>
  );
}
