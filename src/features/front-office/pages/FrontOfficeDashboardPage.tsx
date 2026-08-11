import { Link } from 'react-router-dom';
import { Users, UserCheck, Calendar, MessageSquare, Clock, AlertTriangle, ChevronRight, Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { cn } from '../../../utils/cn';

export default function FrontOfficeDashboardPage() {
  // Mock data for the dashboard
  const stats = {
    todayVisitors: 24,
    currentlyInside: 8,
    todayAppointments: 12,
    openEnquiries: 15,
    pendingFollowups: 7,
    openComplaints: 5,
    criticalComplaints: 2,
  };

  const todayVisitors = [
    { id: '1', name: 'John Smith', host: 'Sarah Johnson', purpose: 'Meeting', badge: 'V001', checkInTime: '09:15 AM', status: 'checked_in' },
    { id: '2', name: 'Emily Davis', host: 'Michael Brown', purpose: 'Interview', badge: 'V002', checkInTime: '10:30 AM', status: 'checked_in' },
    { id: '3', name: 'Robert Wilson', host: 'Jennifer Lee', purpose: 'Delivery', badge: 'V003', checkInTime: '11:00 AM', status: 'checked_out' },
  ];

  const upcomingAppointments = [
    { id: '1', visitor: 'Alice Moore', host: 'David Miller', department: 'Administration', date: '2026-08-10', time: '02:00 PM', purpose: 'Parent Meeting', status: 'scheduled' },
    { id: '2', visitor: 'Thomas Taylor', host: 'Lisa Anderson', department: 'Academics', date: '2026-08-10', time: '03:30 PM', purpose: 'Interview', status: 'confirmed' },
    { id: '3', visitor: 'Maria Garcia', host: 'James Wilson', department: 'Admissions', date: '2026-08-10', time: '04:00 PM', purpose: 'School Tour', status: 'scheduled' },
  ];

  const enquiryFollowups = [
    { id: '1', enquirer: 'Kevin White', category: 'Admission', assignedTo: 'Sarah Johnson', nextFollowup: '2026-08-10', status: 'open' },
    { id: '2', enquirer: 'Nancy Harris', category: 'Sales', assignedTo: 'Michael Brown', nextFollowup: '2026-08-11', status: 'in_progress' },
    { id: '3', enquirer: 'Daniel Clark', category: 'Support', assignedTo: 'Jennifer Lee', nextFollowup: '2026-08-10', status: 'open' },
  ];

  const complaintSummary = {
    open: 5,
    inProgress: 3,
    resolved: 12,
    critical: 2,
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
    <Card className="border-slate-200">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          </div>
          <div className={cn('p-3 rounded-lg', color)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Front Office Overview</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage visitors, enquiries, appointments, and complaints</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/front-office/visitors/new">
            <Button variant="primary" size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Register Visitor
            </Button>
          </Link>
          <Link to="/front-office/enquiries/new">
            <Button variant="secondary" size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Enquiry
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Visitors" value={stats.todayVisitors} icon={Users} color="bg-[#008BE9]/10 text-[#002C6D]" />
        <StatCard title="Currently Inside" value={stats.currentlyInside} icon={UserCheck} color="bg-green-100 text-green-700" />
        <StatCard title="Today's Appointments" value={stats.todayAppointments} icon={Calendar} color="bg-purple-100 text-purple-700" />
        <StatCard title="Open Enquiries" value={stats.openEnquiries} icon={MessageSquare} color="bg-orange-100 text-orange-700" />
        <StatCard title="Pending Follow-ups" value={stats.pendingFollowups} icon={Clock} color="bg-yellow-100 text-yellow-700" />
        <StatCard title="Open Complaints" value={stats.openComplaints} icon={AlertTriangle} color="bg-red-100 text-red-700" />
        <StatCard title="High/Critical" value={stats.criticalComplaints} icon={AlertTriangle} color="bg-red-200 text-red-800" />
      </div>

      {/* Today's Visitors */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Today's Visitors</h2>
            <Link to="/front-office/visitors" className="text-[#008BE9] hover:text-[#002C6D] text-sm font-medium flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700">Visitor</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hidden sm:table-cell">Host</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hidden md:table-cell">Purpose</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hidden md:table-cell">Badge</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700">Check-in</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayVisitors.map((visitor) => (
                  <tr key={visitor.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-900">{visitor.name}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{visitor.host}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{visitor.purpose}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{visitor.badge}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600">{visitor.checkInTime}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        visitor.status === 'checked_in' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      )}>
                        {visitor.status === 'checked_in' ? 'Checked In' : 'Checked Out'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Upcoming Appointments */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Appointments</h2>
            <Link to="/front-office/appointments" className="text-[#008BE9] hover:text-[#002C6D] text-sm font-medium flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700">Visitor</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hidden sm:table-cell">Host</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hidden md:table-cell">Department</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700">Date</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hidden sm:table-cell">Time</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hidden md:table-cell">Purpose</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-900">{appointment.visitor}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{appointment.host}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{appointment.department}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600">{appointment.date}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{appointment.time}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{appointment.purpose}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                      )}>
                        {appointment.status === 'confirmed' ? 'Confirmed' : 'Scheduled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Enquiry Follow-ups */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Enquiry Follow-ups</h2>
            <Link to="/front-office/enquiries" className="text-[#008BE9] hover:text-[#002C6D] text-sm font-medium flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700">Enquirer</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hidden sm:table-cell">Category</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hidden md:table-cell">Assigned To</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700">Next Follow-up</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiryFollowups.map((enquiry) => (
                  <tr key={enquiry.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-900">{enquiry.enquirer}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{enquiry.category}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{enquiry.assignedTo}</td>
                    <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600">{enquiry.nextFollowup}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className={cn(
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        enquiry.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      )}>
                        {enquiry.status === 'in_progress' ? 'In Progress' : 'Open'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Complaint Summary */}
      <Card className="border-slate-200">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Complaint Summary</h2>
            <Link to="/front-office/complaints" className="text-[#008BE9] hover:text-[#002C6D] text-sm font-medium flex items-center">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Open</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{complaintSummary.open}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{complaintSummary.inProgress}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Resolved</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{complaintSummary.resolved}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Critical</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{complaintSummary.critical}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
