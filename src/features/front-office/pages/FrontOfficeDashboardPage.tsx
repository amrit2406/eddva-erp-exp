import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  LogOut,
  Calendar,
  MessageSquare,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  CircleDot,
  CheckCheck,
  XCircle,
  UserX,
  Flag,
  Timer,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import DashboardStatCard from '../components/dashboard/DashboardStatCard';
import RankedBarList from '../components/dashboard/RankedBarList';
import DailyTrendChart from '../components/dashboard/DailyTrendChart';
import { getDashboardSummary } from '../api/dashboard.api';
import { getEmployees } from '../api/employees.api';
import { getApiErrorMessage } from '../utils/rbac.utils';
import type { FrontOfficeDashboardSummary } from '../types/dashboardRecord.types';

const PRIORITY_COLOR: Record<string, string> = {
  low: '#94a3b8',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

function formatResolutionTime(hours: number): string {
  if (!hours || hours <= 0) return '—';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  viewAllHref: string;
}

function SectionHeader({ icon: Icon, title, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#008BE9]" />
        {title}
      </h2>
      <Link to={viewAllHref} className="text-[#008BE9] hover:text-[#002C6D] text-sm font-medium flex items-center">
        View All <ChevronRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
  );
}

export default function FrontOfficeDashboardPage() {
  const [summary, setSummary] = useState<FrontOfficeDashboardSummary | null>(null);
  const [employeeMap, setEmployeeMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, employeesData] = await Promise.all([
        getDashboardSummary(),
        getEmployees({ limit: 100 }).catch(() => ({ data: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } })),
      ]);
      setSummary(summaryData);
      setEmployeeMap(new Map(employeesData.data.map((e) => [e.employee_id, e.name])));
    } catch (err: any) {
      if (err.response?.status === 401) return;
      setError(getApiErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!summary) {
    return <div className="text-center py-8 text-slate-500">No dashboard data available.</div>;
  }

  const { visitors, enquiries, appointments, complaints } = summary;

  const enquiriesBySource = enquiries.by_source.map((s) => ({ label: s.source.replace(/_/g, ' '), count: s.count }));
  const enquiriesByCategory = enquiries.by_category.map((c) => ({ label: c.category.replace(/_/g, ' '), count: c.count }));
  const enquiriesByAssignee = enquiries.by_assignee.map((a) => ({
    label: employeeMap.get(a.assigned_to) ?? `Employee #${a.assigned_to}`,
    count: a.count,
  }));

  const visitorsByHost = visitors.by_host.map((h) => ({ label: `${h.host_name} (${h.department})`, count: h.count }));

  const appointmentsByDepartment = appointments.by_department.map((d) => ({ label: d.department, count: d.count }));
  const appointmentsByEmployee = appointments.by_employee.map((e) => ({ label: e.employee, count: e.count }));

  const complaintsByPriority = complaints.by_priority.map((p) => ({
    label: p.priority,
    count: p.count,
    color: PRIORITY_COLOR[p.priority] ?? PRIORITY_COLOR.low,
  }));
  const complaintsByCategory = complaints.by_category.map((c) => ({ label: c.category.replace(/_/g, ' '), count: c.count }));
  const complaintsByAssignee = complaints.by_assignee.map((a) => ({
    label: employeeMap.get(a.assigned_to) ?? `Employee #${a.assigned_to}`,
    count: a.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Front Office Overview</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage visitors, enquiries, appointments, and complaints</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/front-office/visitors/new">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Visitor
            </Button>
          </Link>
          <Link to="/front-office/enquiries/new">
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Enquiry
            </Button>
          </Link>
          <Link to="/front-office/appointments/new">
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Appointment
            </Button>
          </Link>
          <Link to="/front-office/complaints/new">
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Complaint
            </Button>
          </Link>
        </div>
      </div>

      {/* Visitors */}
      <Card className="border-slate-200">
        <div className="p-6">
          <SectionHeader icon={Users} title="Visitors" viewAllHref="/front-office/visitors" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <DashboardStatCard label="Today's Visitors" value={visitors.today_visitors} icon={Users} color="blue" />
            <DashboardStatCard label="Currently Checked In" value={visitors.currently_checked_in} icon={UserCheck} color="green" />
            <DashboardStatCard label="Checked Out Today" value={visitors.checked_out_today} icon={LogOut} color="slate" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Visits (last few days)</h3>
              <DailyTrendChart data={visitors.by_day} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Hosts</h3>
              <RankedBarList items={visitorsByHost} />
            </div>
          </div>
        </div>
      </Card>

      {/* Enquiries */}
      <Card className="border-slate-200">
        <div className="p-6">
          <SectionHeader icon={MessageSquare} title="Enquiries" viewAllHref="/front-office/enquiries" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <DashboardStatCard label="Total" value={enquiries.total} icon={MessageSquare} color="blue" />
            <DashboardStatCard label="Open" value={enquiries.open} icon={CircleDot} color="slate" />
            <DashboardStatCard label="In Progress" value={enquiries.in_progress} icon={Clock} color="amber" />
            <DashboardStatCard label="Closed" value={enquiries.closed} icon={CheckCheck} color="green" />
            <DashboardStatCard label="Pending Follow-ups" value={enquiries.pending_followups} icon={Clock} color="purple" />
            <Link to="/front-office/enquiries/followups">
              <DashboardStatCard
                label="Overdue Follow-ups"
                value={enquiries.overdue_followups}
                icon={AlertTriangle}
                color={enquiries.overdue_followups > 0 ? 'red' : 'slate'}
                className="cursor-pointer hover:border-red-200 transition-colors"
              />
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">By Source</h3>
              <RankedBarList items={enquiriesBySource} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">By Category</h3>
              <RankedBarList items={enquiriesByCategory} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">By Assignee</h3>
            <RankedBarList items={enquiriesByAssignee} />
          </div>
        </div>
      </Card>

      {/* Appointments */}
      <Card className="border-slate-200">
        <div className="p-6">
          <SectionHeader icon={Calendar} title="Appointments" viewAllHref="/front-office/appointments" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <DashboardStatCard label="Today" value={appointments.today} icon={Calendar} color="blue" />
            <DashboardStatCard label="Upcoming" value={appointments.upcoming} icon={Clock} color="purple" />
            <DashboardStatCard label="Completed" value={appointments.completed} icon={CheckCheck} color="green" />
            <DashboardStatCard label="Cancelled" value={appointments.cancelled} icon={XCircle} color="red" />
            <DashboardStatCard label="No Show" value={appointments.no_show} icon={UserX} color="amber" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">By Department</h3>
              <RankedBarList items={appointmentsByDepartment} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">By Employee</h3>
              <RankedBarList items={appointmentsByEmployee} />
            </div>
          </div>
        </div>
      </Card>

      {/* Complaints */}
      <Card className="border-slate-200">
        <div className="p-6">
          <SectionHeader icon={AlertTriangle} title="Complaints" viewAllHref="/front-office/complaints" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <DashboardStatCard label="Total" value={complaints.total} icon={AlertTriangle} color="blue" />
            <DashboardStatCard label="Open" value={complaints.open} icon={CircleDot} color="slate" />
            <DashboardStatCard label="In Progress" value={complaints.in_progress} icon={Clock} color="amber" />
            <DashboardStatCard label="Resolved" value={complaints.resolved} icon={CheckCheck} color="green" />
            <DashboardStatCard label="Closed" value={complaints.closed} icon={CheckCheck} color="slate" />
            <DashboardStatCard
              label="Critical/High"
              value={complaints.critical_or_high}
              icon={Flag}
              color={complaints.critical_or_high > 0 ? 'red' : 'slate'}
            />
            <DashboardStatCard label="Avg Resolution" value={formatResolutionTime(complaints.average_resolution_hours)} icon={Timer} color="purple" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">By Priority</h3>
              <RankedBarList items={complaintsByPriority} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">By Category</h3>
              <RankedBarList items={complaintsByCategory} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">By Assignee</h3>
            <RankedBarList items={complaintsByAssignee} />
          </div>
        </div>
      </Card>
    </div>
  );
}
