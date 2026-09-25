import { BookOpen, Building2, CalendarRange, FileClock, Receipt } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import StatCard from '../../../../components/data-display/StatCard';
import SummaryDashboard, { StatSection } from '../../../../components/data-display/SummaryDashboard';
import { getDashboardSummary, type AccountsDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';
import { formatDate } from '../../../../utils/formatDate';

function FinancialYearCard({ year }: { year: AccountsDashboardSummary['open_financial_year'] }) {
  return (
    <Card>
      <div className="p-4 flex items-center gap-3">
        <CalendarRange className="h-8 w-8 text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-sm text-slate-500">Open financial year</p>
          {year ? (
            <>
              <p className="text-lg font-semibold text-slate-900">FY {year.fyLabel}</p>
              <p className="text-sm text-slate-600">
                {formatDate(year.startDate)} – {formatDate(year.endDate)}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-amber-600">None open</p>
              <p className="text-sm text-slate-600">Open a financial year before posting vouchers</p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <SummaryDashboard
      title="Accounts Dashboard"
      subtitle="A snapshot of accounts activity"
      load={getDashboardSummary}
      getErrorMessage={getApiErrorMessage}
    >
      {(data) => (
        <>
          <FinancialYearCard year={data.open_financial_year} />

          <StatSection title="Vouchers">
            <StatCard label="Posted this month" value={data.vouchers_posted_this_month} icon={Receipt} />
            <StatCard
              label="Drafts pending"
              value={data.draft_vouchers_pending}
              icon={FileClock}
              status={data.draft_vouchers_pending > 0 ? 'warning' : 'good'}
              hint={data.draft_vouchers_pending > 0 ? 'Awaiting posting' : 'All posted'}
            />
          </StatSection>

          <StatSection title="Setup">
            <StatCard label="Active ledger accounts" value={data.active_ledger_accounts} icon={BookOpen} />
            <StatCard label="Active cost centers" value={data.active_cost_centers} icon={Building2} />
          </StatSection>
        </>
      )}
    </SummaryDashboard>
  );
}
