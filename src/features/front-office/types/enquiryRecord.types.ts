export type FrontOfficeEnquirySource = 'walk_in' | 'phone' | 'email' | 'website';
export type FrontOfficeEnquiryStatus = 'open' | 'in_progress' | 'closed';

export interface FrontOfficeEnquiry {
  enquiry_id: number;
  enquirer_name: string;
  phone?: string;
  email?: string;
  source: FrontOfficeEnquirySource;
  category: string;
  description: string;
  assigned_to?: number | null;
  assignee?: { employee_id: number; name: string; department_id?: number } | null;
  status: FrontOfficeEnquiryStatus;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  followups?: FrontOfficeEnquiryFollowup[];
}

export interface FrontOfficeEnquiryFormData {
  enquirer_name: string;
  phone?: string;
  email?: string;
  source: FrontOfficeEnquirySource;
  category: string;
  description: string;
  assigned_to?: number;
}

export interface EnquiryUpdateFormData {
  enquirer_name?: string;
  phone?: string;
  email?: string;
  source?: FrontOfficeEnquirySource;
  category?: string;
  description?: string;
}

export interface AssignEnquiryFormData {
  assigned_to: number;
  reason?: string;
}

export interface ChangeEnquiryStatusFormData {
  status: FrontOfficeEnquiryStatus;
  reason?: string;
}

export interface FrontOfficeEnquiryFollowup {
  followup_id: number;
  enquiry_id: number;
  notes: string;
  followup_date: string;
  next_followup_date?: string | null;
  updated_by?: string;
  created_at?: string;
}

export interface CreateFollowupFormData {
  notes: string;
  followup_date?: string;
  next_followup_date?: string;
}

export interface FollowupWithEnquiry extends FrontOfficeEnquiryFollowup {
  enquiry?: {
    enquiry_id: number;
    enquirer_name: string;
    status: FrontOfficeEnquiryStatus;
    assigned_to?: number | null;
  };
}

export interface EnquiryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EnquiryListResult {
  data: FrontOfficeEnquiry[];
  pagination: EnquiryPagination;
}

export interface EnquiryQueryParams {
  source?: FrontOfficeEnquirySource;
  category?: string;
  status?: FrontOfficeEnquiryStatus;
  assigned_to?: number;
  search?: string;
  created_from?: string;
  created_to?: string;
  sort?: string;
  page?: number;
  limit?: number;
}
