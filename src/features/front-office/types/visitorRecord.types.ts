export interface FrontOfficeVisitor {
  visitor_id: number;
  full_name: string;
  phone?: string;
  email?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  photo_url?: string;
  organization?: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface FrontOfficeVisitorFormData {
  full_name: string;
  phone?: string;
  email?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  photo_url?: string;
  organization?: string;
}

export interface VisitorPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VisitorListResult {
  data: FrontOfficeVisitor[];
  pagination: VisitorPagination;
}

export interface VisitorQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export type VisitorLogStatus = 'checked_in' | 'checked_out';

export interface VisitorVisit {
  log_id: number;
  visitor_id: number;
  host_employee_id: number;
  host_employee?: { employee_id: number; name: string; department_id: number };
  appointment_id?: number | null;
  purpose?: string;
  badge_number: string;
  check_in_time: string;
  check_out_time?: string | null;
  status: VisitorLogStatus;
}

export type VisitorAppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface VisitorAppointment {
  appointment_id: number;
  visitor_id?: number | null;
  visitor_name: string;
  host_employee_id: number;
  host_employee?: { employee_id: number; name: string };
  department_id: number;
  department?: { name: string };
  appointment_date: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  status: VisitorAppointmentStatus;
}

export interface VisitorAuditLog {
  id: string;
  userId?: string | null;
  user?: { id: string; name: string; email: string } | null;
  entityType: string;
  entityId: string;
  action: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}
