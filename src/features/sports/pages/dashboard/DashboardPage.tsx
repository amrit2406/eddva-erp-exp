import { Award, CalendarClock, Home, Trophy, Users } from 'lucide-react';
import StatCard from '../../../../components/data-display/StatCard';
import SummaryDashboard, { StatSection } from '../../../../components/data-display/SummaryDashboard';
import { getDashboardSummary } from '../../api/dashboard.api';
import { getApiErrorMessage } from '../../utils/rbac.utils';

export default function DashboardPage() {
  return (
    <SummaryDashboard
      title="Sports Dashboard"
      subtitle="A snapshot of sports activity"
      load={getDashboardSummary}
      getErrorMessage={getApiErrorMessage}
    >
      {(data) => (
        <>
          <StatSection title="Competitions">
            <StatCard
              label="Ongoing tournaments"
              value={data.ongoing_tournaments}
              icon={Trophy}
              hint={data.ongoing_tournaments === 0 ? 'None in progress' : undefined}
            />
            <StatCard
              label="Upcoming fixtures"
              value={data.upcoming_fixtures}
              icon={CalendarClock}
              hint={data.upcoming_fixtures === 0 ? 'Nothing scheduled' : undefined}
            />
          </StatSection>

          <StatSection title="Overview">
            <StatCard label="Participants" value={data.total_participants} icon={Users} />
            <StatCard label="Houses" value={data.total_houses} icon={Home} />
            <StatCard label="Records" value={data.total_records} icon={Award} />
          </StatSection>
        </>
      )}
    </SummaryDashboard>
  );
}
