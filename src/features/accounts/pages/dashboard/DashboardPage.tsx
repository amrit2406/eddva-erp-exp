import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  Banknote,
  Bell,
  BookOpen,
  BookText,
  Building2,
  CalendarRange,
  FileClock,
  FilePlus2,
  FileSpreadsheet,
  Landmark,
  Layers,
  NotebookTabs,
  PieChart as PieIcon,
  Receipt,
  Scale,
  Sigma,
  Wallet,
} from 'lucide-react';
import ErrorState from '../../../../components/feedback/ErrorState';
import AttentionList, { type AttentionItem } from '../../../../components/premium/AttentionList';
import { ChartCard, DonutChart, EmptyChart, Gauge, Leaderboard } from '../../../../components/premium/charts';
import DashboardSkeleton from '../../../../components/premium/DashboardSkeleton';
import HeroAction from '../../../../components/premium/HeroAction';
import KpiTile from '../../../../components/premium/KpiTile';
import PageHero from '../../../../components/premium/PageHero';
import SectionHeading from '../../../../components/premium/SectionHeading';
import { humanize, rangeLabel, rupees } from '../../../../utils/dashboardFormat';
import { formatDate } from '../../../../utils/formatDate';
import { getDashboardSummary, type AccountsDashboardSummary, type GroupBalance, type OpenFinancialYear } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';

const stagger = (index: number) => ({ animationDelay: `${Math.min(index, 10) * 50}ms` });

const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, (part / whole) * 100) : 0);

// "₹1,000 Dr" / "₹1,000 Cr".
const balanceText = ({ balance }: GroupBalance) => `${rupees(balance.amount)} ${balance.type === 'CREDIT' ? 'Cr' : 'Dr'}`;

type YearState = 'none' | 'upcoming' | 'running' | 'ended';

function yearState(year: OpenFinancialYear | null, now = Date.now()): YearState {
  if (!year) return 'none';
  if (now < new Date(year.startDate).getTime()) return 'upcoming';
  if (now > new Date(year.endDate).getTime()) return 'ended';
  return 'running';
}

function yearElapsedPct(year: OpenFinancialYear | null, now = Date.now()): number {
  if (!year) return 0;
  const start = new Date(year.startDate).getTime();
  const end = new Date(year.endDate).getTime();
  return Math.max(0, Math.min(100, pct(now - start, end - start)));
}

// Ledgers in the cash group that are clearly not cash (e.g. a payable).
const misgroupedCash = (summary: AccountsDashboardSummary) =>
  summary.cash_and_bank.cash.accounts.filter((a) => /payable|receivable/i.test(a.accountName) || /^A[PR]-/i.test(a.accountCode));

const postedCount = (summary: AccountsDashboardSummary) => summary.vouchers.by_status.find((s) => s.status === 'POSTED')?.count ?? 0;

interface Kpi {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent: string;
}

function buildKpis(summary: AccountsDashboardSummary): Kpi[] {
  const { overview, vouchers, cash_and_bank: cb } = summary;
  const voucherValue = vouchers.by_type.reduce((sum, v) => sum + v.total_debit, 0);
  const voucherTotal = vouchers.by_status.reduce((sum, s) => sum + s.count, 0);
  const fy = overview.open_financial_year;
  return [
    { label: 'Cash balance', value: balanceText(cb.cash), icon: Banknote, hint: `${cb.cash.accounts.length} cash ledgers`, accent: '#008BE9' },
    { label: 'Bank balance', value: balanceText(cb.bank), icon: Landmark, hint: `${cb.bank.accounts.length} bank ledger${cb.bank.accounts.length === 1 ? '' : 's'}`, accent: '#eb6834' },
    { label: 'Vouchers posted', value: postedCount(summary), icon: BookOpen, hint: `of ${voucherTotal} vouchers`, accent: '#15936a' },
    { label: 'Drafts pending', value: vouchers.draft_pending, icon: FileClock, hint: 'Awaiting posting', accent: '#d55181' },
    { label: 'Voucher value', value: rupees(voucherValue), icon: Sigma, hint: 'Total debit across types', accent: '#4a3aa7' },
    { label: 'Ledger accounts', value: overview.active_ledger_accounts, icon: NotebookTabs, hint: 'Active in the chart', accent: '#7c3aed' },
    { label: 'Cost centers', value: overview.active_cost_centers, icon: Building2, hint: 'Active', accent: '#c98500' },
    { label: 'Financial year', value: fy ? `FY ${fy.fyLabel}` : 'None open', icon: CalendarRange, hint: fy ? `${formatDate(fy.startDate)} – ${formatDate(fy.endDate)}` : 'Open one to post', accent: '#0891b2' },
  ];
}

function buildAttention(summary: AccountsDashboardSummary): AttentionItem[] {
  const { overview, vouchers, cash_and_bank: cb } = summary;
  const fy = overview.open_financial_year;
  const state = yearState(fy);
  const misgrouped = misgroupedCash(summary);
  const items: AttentionItem[] = [
    {
      module: 'Financial year',
      label: state === 'none' ? 'No financial year open' : state === 'upcoming' ? "Open financial year hasn't started" : 'Open financial year has ended',
      count: state === 'running' ? 0 : 1,
      detail: fy ? `FY ${fy.fyLabel} · ${formatDate(fy.startDate)} – ${formatDate(fy.endDate)}` : 'Vouchers need an open year',
      hideCount: true,
      severity: 'critical',
      to: '/accounts/financial-years',
    },
    {
      module: 'Cash',
      label: 'Cash shows a credit balance',
      count: cb.cash.balance.type === 'CREDIT' && cb.cash.balance.amount > 0 ? 1 : 0,
      detail: `${balanceText(cb.cash)} — cash can't go below zero`,
      hideCount: true,
      severity: 'critical',
      to: '/accounts/reports/cash-book',
    },
    {
      module: 'Chart of accounts',
      label: 'Non-cash ledger in the cash group',
      count: misgrouped.length,
      detail: misgrouped.map((a) => `${a.accountCode} ${a.accountName}`).join(', '),
      severity: 'warning',
      to: '/accounts/account-mappings',
    },
    { module: 'Vouchers', label: 'Draft vouchers to post', count: vouchers.draft_pending, severity: 'warning', to: '/accounts/vouchers' },
  ];
  return items.filter((item) => item.count > 0);
}

// Posting progress and year progress, pinned under the attention list.
function HealthFooter({ summary }: { summary: AccountsDashboardSummary }) {
  const voucherTotal = summary.vouchers.by_status.reduce((sum, s) => sum + s.count, 0);
  const bars = [
    { label: 'Vouchers posted', value: pct(postedCount(summary), voucherTotal) },
    { label: 'Financial year elapsed', value: yearElapsedPct(summary.overview.open_financial_year) },
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

// One balance panel on the dark card: amount, Dr/Cr badge and its ledgers.
function BalancePanel({ title, icon: Icon, group }: { title: string; icon: LucideIcon; group: GroupBalance }) {
  const credit = group.balance.type === 'CREDIT';
  return (
    <div className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
      <div className="flex items-center gap-2 text-xs text-sky-100/75">
        <Icon className="h-4 w-4 text-sky-200" />
        {title}
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={credit ? { background: 'rgb(208 59 59 / 0.25)', color: '#fecaca' } : { background: 'rgb(12 163 12 / 0.25)', color: '#bbf7d0' }}
        >
          {credit ? 'Credit' : 'Debit'}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{rupees(group.balance.amount)}</p>
      <ul className="mt-3 space-y-1.5">
        {group.accounts.map((account) => (
          <li key={account.id} className="flex items-center gap-2 text-xs">
            <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-sky-100">{account.accountCode}</span>
            <span className="truncate text-sky-50/90">{account.accountName}</span>
          </li>
        ))}
        {group.accounts.length === 0 && <li className="text-xs text-sky-100/60">No ledgers mapped</li>}
      </ul>
    </div>
  );
}

const REPORTS: { label: string; to: string; icon: LucideIcon; color: string }[] = [
  { label: 'Day book', to: '/accounts/reports/day-book', icon: BookText, color: '#008BE9' },
  { label: 'Cash book', to: '/accounts/reports/cash-book', icon: Banknote, color: '#eb6834' },
  { label: 'Bank book', to: '/accounts/reports/bank-book', icon: Landmark, color: '#15936a' },
  { label: 'Trial balance', to: '/accounts/reports/trial-balance', icon: Scale, color: '#4a3aa7' },
  { label: 'Balance sheet', to: '/accounts/reports/balance-sheet', icon: FileSpreadsheet, color: '#d55181' },
  { label: 'Income & expenditure', to: '/accounts/reports/income-expenditure', icon: Wallet, color: '#c98500' },
];

export default function DashboardPage() {
  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['accounts', 'dashboard'],
    queryFn: getDashboardSummary,
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={getApiErrorMessage(error, 'Failed to load dashboard')} onRetry={() => refetch()} />;
  if (!data) return null;

  const { overview, vouchers, cash_and_bank: cb } = data;
  const fy = overview.open_financial_year;
  const state = yearState(fy);
  const kpis = buildKpis(data);
  const attention = buildAttention(data);
  const period = rangeLabel(data.range);
  const voucherTotal = vouchers.by_status.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-5">
          <PageHero
            eyebrow="Accounts"
            title="Accounts overview"
            subtitle="Cash and bank position, voucher flow and the books — at a glance."
            highlights={[
              { icon: CalendarRange, label: fy ? `FY ${fy.fyLabel}${state === 'upcoming' ? ' · not started' : ''}` : 'No open financial year' },
              { icon: BookOpen, label: `${postedCount(data)} vouchers posted` },
              { icon: Layers, label: period },
            ]}
            actions={
              <>
                <HeroAction to="/accounts/vouchers/new" icon={FilePlus2} label="New voucher" primary />
                <HeroAction to="/accounts/reports/trial-balance" icon={Scale} label="Trial balance" />
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

        <ChartCard title="Needs attention" subtitle="Books and postings to fix" icon={Bell} className="lg:col-span-4" style={stagger(2)} fill>
          <AttentionList items={attention} footer={<HealthFooter summary={data} />} />
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Position" title="Cash, bank & the year" />

        <ChartCard tone="dark" title="Cash & bank" subtitle="Closing balances by group" icon={Wallet} className="lg:col-span-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BalancePanel title="Cash" icon={Banknote} group={cb.cash} />
            <BalancePanel title="Bank" icon={Landmark} group={cb.bank} />
          </div>
        </ChartCard>

        <ChartCard title="Financial year" subtitle={fy ? `FY ${fy.fyLabel}` : 'None open'} icon={CalendarRange} className="lg:col-span-5" style={stagger(1)}>
          {fy ? (
            <>
              <Gauge
                label="Year elapsed"
                value={yearElapsedPct(fy)}
                max={100}
                caption={`${formatDate(fy.startDate)} – ${formatDate(fy.endDate)}`}
                color="#0891b2"
              />
              {state !== 'running' && (
                <p className="mt-4 rounded-2xl px-4 py-3 text-sm text-slate-700" style={{ background: 'rgb(250 178 25 / 0.12)' }}>
                  {state === 'upcoming'
                    ? `This year starts on ${formatDate(fy.startDate)}. Today's entries fall outside every open year.`
                    : `This year ended on ${formatDate(fy.endDate)}. Open the next year to keep posting.`}
                </p>
              )}
            </>
          ) : (
            <EmptyChart message="No financial year is open" />
          )}
          <Link to="/accounts/financial-years" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-navy">
            Manage financial years <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </ChartCard>
      </div>

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        <SectionHeading eyebrow="Vouchers" title="Postings & books" />

        <ChartCard title="Vouchers by status" subtitle={`${voucherTotal} vouchers · ${period}`} icon={PieIcon} className="lg:col-span-4">
          <DonutChart totalLabel="vouchers" rows={vouchers.by_status.map((s) => ({ label: humanize(s.status), value: s.count }))} />
        </ChartCard>

        <ChartCard title="Vouchers by type" subtitle="By total debit" icon={Receipt} className="lg:col-span-4" style={stagger(1)}>
          <Leaderboard
            format={rupees}
            rows={[...vouchers.by_type]
              .sort((a, b) => b.total_debit - a.total_debit)
              .map((v) => ({ label: v.voucher_type, value: v.total_debit, detail: `${v.count} voucher${v.count === 1 ? '' : 's'}`, to: '/accounts/vouchers' }))}
          />
        </ChartCard>

        <ChartCard title="Books & reports" subtitle="Jump straight in" icon={BookText} className="lg:col-span-4" style={stagger(2)}>
          <div className="grid grid-cols-2 gap-2.5">
            {REPORTS.map(({ label, to, icon: Icon, color }) => (
              <Link
                key={label}
                to={to}
                className="group flex items-center gap-2.5 rounded-2xl bg-slate-50/80 px-3 py-3 ring-1 ring-slate-100 transition-all hover:bg-white hover:shadow-soft hover:ring-slate-200"
              >
                <Icon className="h-4 w-4 flex-shrink-0" style={{ color }} />
                <span className="text-sm font-medium text-slate-700 leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
