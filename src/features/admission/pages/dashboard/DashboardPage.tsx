import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarCheck,
  ClipboardList,
  FileText,
  Filter,
  GraduationCap,
  IndianRupee,
  Inbox,
  ListChecks,
  MessageSquare,
  PieChart as PieIcon,
  School,
  Send,
  Stamp,
  Armchair,
  UserCheck,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../../components/premium/AttentionList';
import { ChartCard, DonutChart, EmptyChart, Funnel, Gauge, GroupedColumns } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { humanize, rupees, toNumber } from '../../../../utils/dashboardFormat';
import { formatDate } from '../../../../utils/formatDate';
import { getDashboardSummary, type AdmissionDashboardSummary } from '../../api/admission.api';
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

function buildKpis({ kpis, seats }: AdmissionDashboardSummary): Kpi[] {
  const fees = kpis.admission_fees_paid;
  return [
    { label: 'Enquiries', value: kpis.total_enquiries, icon: MessageSquare, hint: `${kpis.new_enquiries} new`, accent: '#008BE9' },
    { label: 'Applications', value: kpis.applications, icon: FileText, hint: `${kpis.applications_under_review} under review`, accent: '#eb6834' },
    { label: 'Tests scheduled', value: kpis.tests_scheduled, icon: ClipboardList, hint: `${kpis.interviews_scheduled} interviews`, accent: '#15936a' },
    { label: 'Shortlisted', value: kpis.shortlisted, icon: ListChecks, hint: 'Cleared assessment', accent: '#d55181' },
    { label: 'Offers issued', value: kpis.offers_issued, icon: Send, hint: `${kpis.offers_accepted} accepted`, accent: '#4a3aa7' },
    { label: 'Fees collected', value: rupees(toNumber(fees.amount_collected)), icon: IndianRupee, hint: `${fees.payments_recorded} payments`, accent: '#7c3aed' },
    { label: 'Confirmed', value: kpis.confirmed_admissions, icon: BadgeCheck, hint: 'Admissions confirmed', accent: '#c98500' },
    { label: 'Seats available', value: seats.available, icon: Armchair, hint: `of ${seats.total_seats} seats`, accent: '#0891b2' },
  ];
}

function buildAttention({ kpis, applications_by_status: byStatus }: AdmissionDashboardSummary): AttentionItem[] {
  const items: AttentionItem[] = [
    { module: 'Enquiries', label: 'Follow-ups due', count: kpis.enquiry_followups_due, severity: 'critical', to: '/admission/enquiries' },
    { module: 'Applications', label: 'Awaiting review', count: kpis.applications_under_review, severity: 'warning', to: '/admission/applications' },
    { module: 'Applications', label: 'Drafts not submitted', count: byStatus?.draft ?? 0, severity: 'warning', to: '/admission/applications' },
    {
      module: 'Offers',
      label: 'Offers awaiting acceptance',
      count: Math.max(0, kpis.offers_issued - kpis.offers_accepted),
      severity: 'warning',
      to: '/admission/offers',
    },
    {
      module: 'Fees',
      label: 'Accepted offers not fully paid',
      count: Math.max(0, kpis.offers_accepted - kpis.admission_fees_paid.applications_fully_paid),
      severity: 'warning',
      to: '/admission/payments',
    },
  ];
  return items.filter((item) => item.count > 0);
}

// Seat fill and offer acceptance, pinned under the attention list.
function HealthFooter({ summary }: { summary: AdmissionDashboardSummary }) {
  const bars = [
    { label: 'Seats filled', value: pct(summary.seats.confirmed, summary.seats.total_seats) },
    { label: 'Enquiries converted to applications', value: pct(summary.kpis.applications, summary.kpis.total_enquiries) },
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

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
      {humanize(status)}
    </span>
  );
}

// First string field that looks like an identifier, for items whose shape we haven't seen.
function pickLabel(item: Record<string, unknown>): string {
  for (const key of ['confirmation_number', 'admission_number', 'application_number', 'enrollment_number']) {
    if (typeof item[key] === 'string') return item[key] as string;
  }
  return 'Confirmation';
}

function pickName(item: Record<string, unknown>): string | undefined {
  const applicant = item.applicant as { name?: unknown } | undefined;
  if (typeof applicant?.name === 'string') return applicant.name;
  return typeof item.student_name === 'string' ? item.student_name : undefined;
}

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['admission', 'dashboard'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load the dashboard')} onRetry={() => refetch()} />;
  if (!data) return null;

  const { kpis, seats } = data;
  const kpiTiles = buildKpis(data);
  const attention = buildAttention(data);
  const recentApplications = data.recent?.applications ?? [];
  const recentConfirmations = data.recent?.confirmations ?? [];
  const statusRows = Object.entries(data.applications_by_status ?? {}).map(([status, count]) => ({ label: humanize(status), value: count }));

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Admission"
            title="Admissions overview"
            subtitle="From first enquiry to confirmed seat — where every candidate stands."
            highlights={[
              { icon: Armchair, label: `${seats.available} of ${seats.total_seats} seats open` },
              { icon: FileText, label: `${kpis.applications} application${kpis.applications === 1 ? '' : 's'}` },
              { icon: BadgeCheck, label: `${kpis.confirmed_admissions} confirmed` },
            ]}
            updatedAt={dataUpdatedAt}
            refreshing={isFetching}
            onRefresh={() => refetch()}
          />
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
            {kpiTiles.map((kpi, index) => (
              <KpiTile key={kpi.label} {...kpi} style={stagger(index)} />
            ))}
          </div>
        </div>

        <ChartCard title="Needs attention" subtitle="Candidates waiting on the office" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<HealthFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Pipeline" title="Candidate journey" />

        <ChartCard title="Admission funnel" subtitle="Candidates at each stage" icon={Filter} className="lg:col-span-7">
          <Funnel rows={(data.funnel ?? []).map((f) => ({ label: humanize(f.stage), value: f.count }))} />
        </ChartCard>
        <ChartCard title="Applications by status" subtitle={`${kpis.applications} total`} icon={PieIcon} className="lg:col-span-5" style={stagger(1)}>
          <DonutChart totalLabel="applications" rows={statusRows} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Capacity" title="Seats & offers" />

        <ChartCard tone="dark" title="Seat allocation" subtitle={`${seats.total_seats} seats in total`} icon={School} className="lg:col-span-7">
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { name: 'Total seats', value: seats.total_seats },
              { name: 'Confirmed', value: seats.confirmed },
              { name: 'Available', value: seats.available },
            ].map((s) => (
              <div key={s.name} className="rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                <p className="text-xs text-sky-100/75">{s.name}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">{s.value.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <GroupedColumns
            tone="dark"
            rows={[
              { label: 'Offered', seats: seats.offered },
              { label: 'Accepted', seats: seats.accepted },
              { label: 'Confirmed', seats: seats.confirmed },
            ]}
            series={[{ key: 'seats', name: 'Seats' }]}
            height={200}
            showValues
          />
        </ChartCard>

        <ChartCard title="Conversion" subtitle="How candidates move through offers" icon={UserCheck} className="lg:col-span-5" style={stagger(1)}>
          <div className="grid grid-cols-2 gap-3">
            <Gauge
              label="Seats filled"
              value={seats.confirmed}
              max={seats.total_seats}
              caption={`${seats.confirmed} of ${seats.total_seats} confirmed`}
              color="#008BE9"
            />
            <Gauge
              label="Offers accepted"
              value={kpis.offers_accepted}
              max={kpis.offers_issued}
              caption={`${kpis.offers_accepted} of ${kpis.offers_issued} offers`}
              color="#1baf7a"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Tests', value: kpis.tests_scheduled, icon: ClipboardList, color: '#008BE9' },
              { label: 'Interviews', value: kpis.interviews_scheduled, icon: CalendarCheck, color: '#eb6834' },
              { label: 'Fully paid', value: kpis.admission_fees_paid.applications_fully_paid, icon: Stamp, color: '#15936a' },
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
        <SectionHeading eyebrow="Activity" title="Latest movement" />

        <ChartCard title="Recent applications" subtitle="Newest first" icon={Inbox} className="lg:col-span-7">
          {recentApplications.length === 0 ? (
            <EmptyChart message="No applications yet" />
          ) : (
            <ul className="space-y-1.5">
              {recentApplications.map((app) => (
                <li key={app.application_id}>
                  <Link
                    to={`/admission/applications/${app.application_id}`}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-transparent transition-all hover:bg-slate-50 hover:ring-slate-200"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-brand-navy/10 ring-1 ring-brand/15">
                      <GraduationCap className="h-4 w-4 text-brand-navy" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{app.applicant?.name ?? 'Applicant'}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {app.application_number}
                        {app.program?.name && ` · Program ${app.program.name}`} · {formatDate(app.application_date)}
                      </p>
                    </div>
                    <StatusPill status={app.status} />
                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>

        <ChartCard title="Recent confirmations" subtitle="Seats secured" icon={BadgeCheck} className="lg:col-span-5" style={stagger(1)}>
          {recentConfirmations.length === 0 ? (
            <EmptyChart message="No confirmations yet" />
          ) : (
            <ul className="space-y-1.5">
              {recentConfirmations.map((item, index) => {
                const name = pickName(item);
                return (
                  <li key={index} className="flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-slate-100">
                    <BadgeCheck className="h-4 w-4 flex-shrink-0" style={{ color: '#0ca30c' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{name ?? pickLabel(item)}</p>
                      {name && <p className="text-xs text-slate-500 truncate">{pickLabel(item)}</p>}
                    </div>
                    {typeof item.status === 'string' && <StatusPill status={item.status} />}
                  </li>
                );
              })}
            </ul>
          )}
          <Link to="/admission/confirmations" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-navy">
            View all confirmations <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </ChartCard>
      </div>
    </div>
  );
}
