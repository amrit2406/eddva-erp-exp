import { Users, GraduationCap, IndianRupee, Calendar } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import StatCard from '../components/StatCard';
import AttendanceOverview from '../components/AttendanceOverview';
import FeeOverview from '../components/FeeOverview';
import RecentActivity from '../components/RecentActivity';
import LoadingState from '../../../components/feedback/LoadingState';
import ErrorState from '../../../components/feedback/ErrorState';
import type { RecentActivityItem } from '../index';

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load dashboard" onRetry={() => refetch()} />;
  }

  if (!data) {
    return null;
  }

  const { stats, recentActivities } = data;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-600">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          icon={Users}
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard
          title="Today's Attendance"
          value={stats.todayAttendance}
          icon={Calendar}
        />
        <StatCard
          title="Pending Fees"
          value={`$${stats.pendingFees.toLocaleString()}`}
          icon={IndianRupee}
          trend={{ value: 8, isPositive: false }}
        />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <AttendanceOverview />
        <FeeOverview />
      </div>

      <RecentActivity activities={recentActivities as RecentActivityItem[]} />
    </div>
  );
}
