import { FileWarning, Monitor, Receipt, TrendingUp, Users, Wallet } from 'lucide-react';
import StatCard from '../../../../components/data-display/StatCard';
import SummaryDashboard, { StatSection } from '../../../../components/data-display/SummaryDashboard';
import { getDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/errors';
import { formatCurrency } from '../../../../utils/formatCurrency';

export default function DashboardPage() {
  return (
    <SummaryDashboard
      title="Canteen Dashboard"
      subtitle="A snapshot of canteen activity"
      load={getDashboardSummary}
      getErrorMessage={getApiErrorMessage}
    >
      {(data) => (
        <>
          <StatSection title="Today">
            <StatCard label="Orders" value={data.todays_order_count} icon={Receipt} />
            <StatCard label="Revenue" value={formatCurrency(data.todays_revenue)} icon={TrendingUp} />
            <StatCard
              label="Active POS shifts"
              value={data.active_pos_shifts}
              icon={Monitor}
              hint={data.active_pos_shifts === 0 ? 'No counter open' : undefined}
            />
          </StatSection>

          <StatSection title="Outstanding">
            <StatCard
              label="Unpaid orders"
              value={data.unpaid_orders}
              icon={FileWarning}
              status={data.unpaid_orders > 0 ? 'warning' : 'good'}
              hint={data.unpaid_orders > 0 ? 'Awaiting payment' : 'All settled'}
            />
          </StatSection>

          <StatSection title="Members & wallets">
            <StatCard label="Members" value={data.total_members} icon={Users} />
            <StatCard label="Total wallet balance" value={formatCurrency(data.total_active_wallet_balance)} icon={Wallet} />
          </StatSection>
        </>
      )}
    </SummaryDashboard>
  );
}
