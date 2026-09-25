import { BookOpen, Clock, Users, Wallet } from 'lucide-react';
import StatCard from '../../../../components/data-display/StatCard';
import SummaryDashboard, { StatSection } from '../../../../components/data-display/SummaryDashboard';
import { getDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/apiError';
import { formatCurrency } from '../../../../utils/formatCurrency';

export default function DashboardPage() {
  return (
    <SummaryDashboard
      title="Library Dashboard"
      subtitle="A snapshot of library activity"
      load={getDashboardSummary}
      getErrorMessage={getApiErrorMessage}
    >
      {(data) => (
        <>
          <StatSection title="Collection">
            <StatCard label="Total books" value={data.total_books} icon={BookOpen} />
            <StatCard label="Total members" value={data.total_members} icon={Users} />
          </StatSection>

          <StatSection title="Circulation">
            <StatCard label="Currently issued" value={data.currently_issued} icon={Clock} />
            <StatCard
              label="Overdue"
              value={data.overdue}
              status={data.overdue > 0 ? 'critical' : 'good'}
              hint={data.overdue > 0 ? 'Past due date' : 'Nothing overdue'}
            />
            <StatCard
              label="Pending fines"
              value={formatCurrency(data.pending_fines_total)}
              icon={Wallet}
              status={data.pending_fines_total > 0 ? 'warning' : undefined}
              hint={data.pending_fines_total > 0 ? 'To be collected' : 'No dues'}
            />
          </StatSection>
        </>
      )}
    </SummaryDashboard>
  );
}
