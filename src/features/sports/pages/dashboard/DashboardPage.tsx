import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Award,
  Bell,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  Crown,
  Flag,
  Home,
  Medal,
  PieChart as PieIcon,
  PlayCircle,
  Swords,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../../components/premium/AttentionList';
import { ChartCard, DonutChart, EmptyChart, Gauge } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { humanize, rangeLabel } from '../../../../utils/dashboardFormat';
import { formatDate } from '../../../../utils/formatDate';
import { getDashboardSummary, type SportsDashboardSummary, type SportsHouseStanding } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';

const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, (part / whole) * 100) : 0);

// House colors come from the data, so pick readable text for whatever they are.
function inkOn(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return '#0f172a';
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.4 ? '#0f172a' : '#ffffff';
}

const sortedStandings = (standings: SportsHouseStanding[]) => [...standings].sort((a, b) => a.rank - b.rank);

// Houses sharing the top score (empty when nobody has scored).
function leaders(standings: SportsHouseStanding[]): SportsHouseStanding[] {
  const top = Math.max(0, ...standings.map((s) => s.total_points));
  return top > 0 ? standings.filter((s) => s.total_points === top) : [];
}

const leaderLabel = (houses: SportsHouseStanding[]) =>
  houses.length === 0 ? 'No points yet' : houses.length === 1 ? `${humanize(houses[0].house)} leads` : `${houses.map((h) => humanize(h.house)).join(' & ')} tied`;

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
}

function buildKpis({ range, participants, tournaments, houses, fixtures, records_and_awards: records }: SportsDashboardSummary): Kpi[] {
  const fixtureTotal = fixtures.by_status.reduce((sum, f) => sum + f.count, 0);
  const fixturesDone = fixtures.by_status.find((f) => f.status === 'completed')?.count ?? 0;
  const top = leaders(houses.standings);
  return [
    { label: 'Participants', value: participants.total, icon: Users, hint: 'Registered athletes', accent: '#008BE9' },
    { label: 'Houses', value: houses.total, icon: Home, hint: houses.academic_year ? `AY ${houses.academic_year}` : undefined, accent: '#eb6834' },
    { label: 'Ongoing', value: tournaments.ongoing, icon: PlayCircle, hint: `${tournaments.upcoming} upcoming`, accent: '#15936a' },
    { label: 'Completed', value: tournaments.completed, icon: CheckCircle2, hint: `${tournaments.started_in_range} started · ${rangeLabel(range)}`, accent: '#d55181' },
    { label: 'Fixtures', value: fixtureTotal, icon: Swords, hint: `${fixturesDone} completed`, accent: '#4a3aa7' },
    { label: 'Records', value: records.total_records, icon: Timer, hint: 'Set to date', accent: '#7c3aed' },
    { label: 'Awards', value: records.total_awards, icon: Medal, hint: 'Awarded to date', accent: '#c98500' },
    { label: 'Top score', value: top[0]?.total_points ?? 0, icon: Crown, hint: leaderLabel(top), accent: '#0891b2' },
  ];
}

function buildAttention({ houses, fixtures, tournaments, participants }: SportsDashboardSummary): AttentionItem[] {
  const top = leaders(houses.standings);
  const scored = houses.standings.filter((s) => s.total_points > 0).length;
  const openFixtures = fixtures.by_status.filter((f) => !['completed', 'cancelled'].includes(f.status)).reduce((sum, f) => sum + f.count, 0);
  const items: AttentionItem[] = [
    {
      module: 'Houses',
      label: 'Tie at the top',
      count: top.length > 1 ? 1 : 0,
      detail: `${top.map((h) => humanize(h.house)).join(' & ')} on ${top[0]?.total_points ?? 0} pts`,
      hideCount: true,
      severity: 'warning',
      to: '/sports/houses/standings',
    },
    {
      module: 'Houses',
      label: 'Houses yet to score',
      count: scored > 0 ? houses.standings.length - scored : 0,
      severity: 'warning',
      to: '/sports/houses/standings',
    },
    { module: 'Fixtures', label: 'Fixtures still to play', count: openFixtures, severity: 'warning', to: '/sports/tournaments' },
    {
      module: 'Tournaments',
      label: 'Upcoming with few participants',
      count: tournaments.upcoming > 0 && participants.total < 2 ? tournaments.upcoming : 0,
      detail: `${participants.total} participant${participants.total === 1 ? '' : 's'} registered`,
      severity: 'warning',
      to: '/sports/participants',
    },
  ];
  return items.filter((item) => item.count > 0);
}

// Season progress and houses on the board, pinned under the attention list.
function HealthFooter({ summary }: { summary: SportsDashboardSummary }) {
  const { tournaments, houses } = summary;
  const bars = [
    { label: 'Tournaments completed', value: pct(tournaments.completed, tournaments.ongoing + tournaments.upcoming + tournaments.completed) },
    { label: 'Houses on the board', value: pct(houses.standings.filter((s) => s.total_points > 0).length, houses.standings.length) },
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

// Top three houses on podium steps (2nd · 1st · 3rd), in each house's own color.
function Podium({ standings }: { standings: SportsHouseStanding[] }) {
  const ranked = sortedStandings(standings).slice(0, 3);
  if (ranked.length === 0) return <EmptyChart message="No houses yet" />;
  const order = [ranked[1], ranked[0], ranked[2]].filter(Boolean) as SportsHouseStanding[];
  const stepHeight: Record<number, string> = { 0: 'h-32', 1: 'h-24', 2: 'h-16' };

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5 pt-2">
      {order.map((house) => {
        const place = ranked.indexOf(house);
        return (
          <div key={house.house} className="flex w-24 sm:w-28 flex-col items-center">
            {place === 0 && <Crown className="mb-1 h-6 w-6 text-amber-300 drop-shadow" />}
            <p className="text-sm font-semibold text-white">{humanize(house.house)}</p>
            <p className="mb-2 text-xs text-sky-100/75 tabular-nums">{house.total_points} pts</p>
            <div
              className={`relative flex w-full ${stepHeight[place]} items-start justify-center rounded-t-2xl pt-3 shadow-lg ring-1 ring-white/20`}
              style={{ background: `linear-gradient(180deg, ${house.color}, ${house.color}cc)` }}
            >
              <span className="text-2xl font-bold tabular-nums" style={{ color: inkOn(house.color) }}>
                {house.rank}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Every house as a points bar in its own color.
function PointsTable({ standings }: { standings: SportsHouseStanding[] }) {
  const ranked = sortedStandings(standings);
  if (ranked.length === 0) return <EmptyChart message="No houses yet" />;
  const max = Math.max(1, ...ranked.map((s) => s.total_points));

  return (
    <ol className="space-y-3.5">
      {ranked.map((house) => (
        <li key={house.house} className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold shadow-sm ring-1 ring-black/5"
            style={{ background: house.color, color: inkOn(house.color) }}
          >
            {house.rank}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">{humanize(house.house)}</p>
              <p className="text-sm font-semibold text-slate-900 tabular-nums">{house.total_points} pts</p>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${(house.total_points / max) * 100}%`, background: house.color }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

const statusRows = (rows: { status: string; count: number }[]) => rows.map((row) => ({ label: humanize(row.status), value: row.count }));

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['sports', 'dashboard'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load dashboard')} onRetry={() => refetch()} />;
  if (!data) return null;

  const { tournaments, houses, fixtures, records_and_awards: records } = data;
  const kpis = buildKpis(data);
  const attention = buildAttention(data);
  const tournamentTotal = tournaments.ongoing + tournaments.upcoming + tournaments.completed;

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Sports"
            title="Sports overview"
            subtitle="House standings, tournaments and the records being set this season."
            highlights={[
              { icon: Crown, label: leaderLabel(leaders(houses.standings)) },
              { icon: Trophy, label: `${tournaments.upcoming} upcoming tournament${tournaments.upcoming === 1 ? '' : 's'}` },
              { icon: CalendarRange, label: houses.academic_year ? `AY ${houses.academic_year}` : rangeLabel(data.range) },
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

        <ChartCard title="Needs attention" subtitle="Standings and fixtures to follow up" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<HealthFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Houses" title="The house race" />

        <ChartCard
          tone="dark"
          title="Podium"
          subtitle={`${houses.total} houses${houses.academic_year ? ` · AY ${houses.academic_year}` : ''}`}
          icon={Crown}
          className="lg:col-span-7"
          action={
            <Link to="/sports/houses/standings" className="inline-flex items-center gap-1 text-xs font-medium text-sky-200 hover:text-white">
              Full standings <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <Podium standings={houses.standings} />
        </ChartCard>

        <ChartCard title="Points table" subtitle="Every house by points" icon={Flag} className="lg:col-span-5" style={stagger(1)}>
          <PointsTable standings={houses.standings} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Competition" title="Tournaments & fixtures" />

        <ChartCard title="Season progress" subtitle={`${tournamentTotal} tournament${tournamentTotal === 1 ? '' : 's'}`} icon={Trophy} className="lg:col-span-4">
          <Gauge
            label="Completed"
            value={tournaments.completed}
            max={tournamentTotal}
            caption={`${tournaments.completed} of ${tournamentTotal} finished`}
            color="#008BE9"
          />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Ongoing', value: tournaments.ongoing, icon: PlayCircle, color: '#15936a' },
              { label: 'Upcoming', value: tournaments.upcoming, icon: CalendarClock, color: '#eb6834' },
              { label: 'Completed', value: tournaments.completed, icon: CheckCircle2, color: '#008BE9' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl bg-slate-50/80 px-3 py-3 ring-1 ring-slate-100">
                <Icon className="h-4 w-4" style={{ color }} />
                <p className="mt-1.5 text-lg font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
                <p className="text-[11px] text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="Tournaments by status" subtitle={`${tournaments.started_in_range} started · ${rangeLabel(data.range)}`} icon={PieIcon} className="lg:col-span-4" style={stagger(1)}>
          <DonutChart totalLabel="tournaments" rows={statusRows(tournaments.by_status)} />
        </ChartCard>
        <ChartCard title="Fixtures by status" subtitle="Matches scheduled and played" icon={Swords} className="lg:col-span-4" style={stagger(2)}>
          <DonutChart totalLabel="fixtures" rows={statusRows(fixtures.by_status)} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Achievements" title="Records & awards" />

        <ChartCard title="Recent records" subtitle={`${records.total_records} on the books`} icon={Timer} className="lg:col-span-7">
          {records.recent_records.length === 0 ? (
            <EmptyChart message="No records set yet" />
          ) : (
            <ul className="space-y-1.5">
              {records.recent_records.map((record) => (
                <li key={record.record_id}>
                  <Link
                    to="/sports/records"
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-transparent transition-all hover:bg-slate-50 hover:ring-slate-200"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/15 to-brand-navy/10 ring-1 ring-brand/15">
                      <Award className="h-4 w-4 text-brand-navy" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{record.description}</p>
                      <p className="text-xs text-slate-500">{formatDate(record.achieved_date)}</p>
                    </div>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-900 tabular-nums">{record.value}</span>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-all group-hover:text-brand group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ChartCard>

        <ChartCard title="Honours" subtitle="Records and awards to date" icon={Medal} className="lg:col-span-5" style={stagger(1)}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Records', value: records.total_records, icon: Timer, color: '#7c3aed', to: '/sports/records' },
              { label: 'Awards', value: records.total_awards, icon: Medal, color: '#c98500', to: '/sports/awards' },
            ].map(({ label, value, icon: Icon, color, to }) => (
              <Link
                key={label}
                to={to}
                className="group rounded-2xl bg-slate-50/80 px-4 py-4 ring-1 ring-slate-100 transition-all hover:bg-white hover:shadow-soft hover:ring-slate-200"
              >
                <Icon className="h-5 w-5" style={{ color }} />
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  {label} <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </p>
              </Link>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
