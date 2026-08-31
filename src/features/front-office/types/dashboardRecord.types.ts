export interface FrontOfficeDashboardRange {
  from: string | null;
  to: string | null;
}

export interface VisitorsByDay {
  day: string;
  count: number;
}

export interface VisitorsByHost {
  host_employee_id: number;
  host_name: string;
  department: string;
  count: number;
}

export interface FrontOfficeDashboardVisitors {
  today_visitors: number;
  currently_checked_in: number;
  checked_out_today: number;
  by_day: VisitorsByDay[];
  by_host: VisitorsByHost[];
}

export interface EnquiriesBySource {
  source: string;
  count: number;
}

export interface EnquiriesByCategory {
  category: string;
  count: number;
}

export interface EnquiriesByAssignee {
  assigned_to: number;
  count: number;
}

export interface FrontOfficeDashboardEnquiries {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  by_source: EnquiriesBySource[];
  by_category: EnquiriesByCategory[];
  by_assignee: EnquiriesByAssignee[];
  pending_followups: number;
  overdue_followups: number;
}

export interface AppointmentsByDepartment {
  department_id: number;
  department: string;
  count: number;
}

export interface AppointmentsByEmployee {
  host_employee_id: number;
  employee: string;
  count: number;
}

export interface FrontOfficeDashboardAppointments {
  today: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  no_show: number;
  by_department: AppointmentsByDepartment[];
  by_employee: AppointmentsByEmployee[];
}

export interface ComplaintsByPriority {
  priority: string;
  count: number;
}

export interface ComplaintsByCategory {
  category: string;
  count: number;
}

export interface ComplaintsByAssignee {
  assigned_to: number;
  count: number;
}

export interface FrontOfficeDashboardComplaints {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  critical_or_high: number;
  by_priority: ComplaintsByPriority[];
  by_category: ComplaintsByCategory[];
  by_assignee: ComplaintsByAssignee[];
  average_resolution_hours: number;
}

export interface FrontOfficeDashboardSummary {
  range: FrontOfficeDashboardRange;
  visitors: FrontOfficeDashboardVisitors;
  enquiries: FrontOfficeDashboardEnquiries;
  appointments: FrontOfficeDashboardAppointments;
  complaints: FrontOfficeDashboardComplaints;
}
