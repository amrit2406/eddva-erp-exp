export type FrontOfficeAppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface FrontOfficeAppointment {
  appointment_id: number;
  visitor_id?: number | null;
  visitor_name: string;
  phone?: string;
  host_employee_id: number;
  host_employee?: { employee_id: number; name: string; designation?: string };
  department_id: number;
  department?: { department_id: number; name: string };
  appointment_date: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  status: FrontOfficeAppointmentStatus;
  notes?: string;
  cancellation_reason?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentFormData {
  visitor_id?: number;
  visitor_name: string;
  phone?: string;
  host_employee_id: number;
  department_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  purpose?: string;
}

export interface AppointmentUpdateFormData {
  visitor_id?: number;
  visitor_name?: string;
  phone?: string;
  purpose?: string;
}

export interface CancelAppointmentFormData {
  reason?: string;
}

export interface CompleteAppointmentFormData {
  notes?: string;
}

export interface RescheduleAppointmentFormData {
  appointment_date: string;
  start_time: string;
  end_time: string;
  host_employee_id?: number;
}

export interface AppointmentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AppointmentListResult {
  data: FrontOfficeAppointment[];
  pagination: AppointmentPagination;
}

export interface AppointmentQueryParams {
  search?: string;
  status?: FrontOfficeAppointmentStatus;
  host_employee_id?: number;
  department_id?: number;
  from?: string;
  to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentAvailabilityParams {
  host_employee_id: number;
  date: string;
}

export interface AppointmentTimeRange {
  start_time: string;
  end_time: string;
}

export interface AppointmentAvailabilityResult {
  employee_id: number;
  date: string;
  configured: boolean;
  booked: AppointmentTimeRange[];
  free_slots: AppointmentTimeRange[];
}

export interface AppointmentConflictParams {
  host_employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
  exclude_id?: number;
}

export interface AppointmentConflictResult {
  has_conflict: boolean;
  conflicts: FrontOfficeAppointment[];
}
