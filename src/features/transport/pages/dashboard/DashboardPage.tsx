import { BellRing, Bus, Route, UserCheck, Wallet } from 'lucide-react';
import StatCard from '../../../../components/data-display/StatCard';
import SummaryDashboard, { StatSection } from '../../../../components/data-display/SummaryDashboard';
import { getDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';
import { formatCurrency } from '../../../../utils/formatCurrency';

export default function DashboardPage() {
  return (
    <SummaryDashboard
      title="Transport Dashboard"
      subtitle="A snapshot of transport activity"
      load={getDashboardSummary}
      getErrorMessage={getApiErrorMessage}
    >
      {(data) => (
        <>
          <StatSection title="At a glance">
            <StatCard
              label="Unresolved alerts"
              value={data.unresolved_alerts}
              icon={BellRing}
              status={data.unresolved_alerts > 0 ? 'critical' : 'good'}
              hint={data.unresolved_alerts > 0 ? 'Open alerts to review' : 'All clear'}
            />
            <StatCard label="Fees collected this month"value={formatCurrency(data.fee_collection_this_month)} icon={Wallet} />
          </StatSection>

          <StatSection title="Fleet">
            <StatCard label="Active vehicles" value={data.active_vehicles} icon={Bus} />
            <StatCard label="Routes" value={data.total_routes} icon={Route} />
            <StatCard label="Active passengers" value={data.active_passengers} icon={UserCheck} />
          </StatSection>
        </>
      )}
    </SummaryDashboard>
  );
}
