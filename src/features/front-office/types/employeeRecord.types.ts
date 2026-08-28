export type FrontOfficeEmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface FrontOfficeEmployee {
  employee_id: number;
  name: string;
  department_id: number;
  department?: { department_id: number; name: string };
  designation?: string;
  email?: string;
  phone?: string;
  status: FrontOfficeEmployeeStatus;
  created_at?: string;
  updated_at?: string;
}

export interface FrontOfficeEmployeeFormData {
  name: string;
  department_id: number;
  designation?: string;
  email?: string;
  phone?: string;
}

export interface FrontOfficeEmployeeUpdateData extends Partial<FrontOfficeEmployeeFormData> {
  status?: FrontOfficeEmployeeStatus;
}

export interface EmployeePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmployeeListResult {
  data: FrontOfficeEmployee[];
  pagination: EmployeePagination;
}

export interface EmployeeQueryParams {
  search?: string;
  department_id?: number;
  page?: number;
  limit?: number;
}

export interface AvailabilitySlot {
  slot_id: number;
  employee_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at?: string;
}

export interface AvailabilitySlotFormData {
  date: string;
  start_time: string;
  end_time: string;
  is_available?: boolean;
}

export type AvailabilitySlotUpdateData = Partial<AvailabilitySlotFormData>;

export interface FindAvailableParams {
  date: string;
  start_time: string;
  end_time: string;
  department_id?: number;
}

export type EmployeeAppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface EmployeeAppointment {
  appointment_id: number;
  visitor_id?: number | null;
  visitor_name: string;
  phone?: string;
  host_employee_id: number;
  department_id: number;
  department?: { name: string };
  visitor?: {
    visitor_id: number;
    full_name: string;
    phone?: string;
    email?: string;
    organization?: string;
  };
  appointment_date: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  status: EmployeeAppointmentStatus;
  created_at?: string;
}

export interface EmployeeAppointmentsQuery {
  from?: string;
  to?: string;
  status?: string;
}
