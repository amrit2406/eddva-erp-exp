export type FrontOfficeComplaintPriority = 'low' | 'medium' | 'high' | 'critical';
export type FrontOfficeComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface FrontOfficeComplaint {
  complaint_id: number;
  complainant_name: string;
  phone?: string;
  email?: string;
  category: string;
  description: string;
  priority: FrontOfficeComplaintPriority;
  assigned_to?: number | null;
  assignee?: { employee_id: number; name: string; department_id?: number } | null;
  status: FrontOfficeComplaintStatus;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string | null;
}

export interface ComplaintFormData {
  complainant_name: string;
  phone?: string;
  email?: string;
  category: string;
  description: string;
  priority: FrontOfficeComplaintPriority;
  assigned_to?: number;
}

export interface ComplaintUpdateFormData {
  complainant_name?: string;
  phone?: string;
  email?: string;
  category?: string;
  description?: string;
}

export interface AssignComplaintFormData {
  assigned_to: number;
  reason?: string;
}

export interface ChangeComplaintPriorityFormData {
  priority: FrontOfficeComplaintPriority;
  reason?: string;
}

export interface ChangeComplaintStatusFormData {
  status: FrontOfficeComplaintStatus;
  reason?: string;
}

export interface EscalateComplaintFormData {
  to_employee_id: number;
  reason: string;
}

export interface FrontOfficeComplaintUpdate {
  update_id: number;
  complaint_id: number;
  notes: string;
  status_change?: string | null;
  updated_by?: string;
  updated_at: string;
}

export interface CreateComplaintUpdateFormData {
  notes: string;
}

export interface ComplaintPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ComplaintListResult {
  data: FrontOfficeComplaint[];
  pagination: ComplaintPagination;
}

export interface ComplaintQueryParams {
  search?: string;
  category?: string;
  priority?: FrontOfficeComplaintPriority;
  status?: FrontOfficeComplaintStatus;
  assigned_to?: number;
  created_from?: string;
  created_to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
