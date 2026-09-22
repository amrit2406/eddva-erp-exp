// Employment history
export interface EmploymentEntry {
  employment_id: number;
  company: string;
  designation: string;
  industry: string;
  location: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmploymentFormData {
  company: string;
  designation: string;
  industry: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

// Groups
export interface AlumniGroup {
  group_id: number;
  name: string;
  group_type: string;
  description?: string | null;
  member_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GroupFormData {
  name: string;
  group_type: string;
  description: string;
}

// Events
export interface AlumniEvent {
  event_id: number;
  title: string;
  description?: string | null;
  event_type: string;
  mode: string;
  venue?: string | null;
  online_link?: string | null;
  event_date: string;
  ends_at?: string | null;
  registration_deadline?: string | null;
  max_capacity?: number | null;
  is_paid: boolean;
  ticket_price?: number | null;
  status?: string | null;
  banner_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  event_type: string;
  mode: string;
  venue: string;
  online_link: string;
  event_date: string;
  ends_at: string;
  registration_deadline: string;
  max_capacity: string;
  is_paid: boolean;
  ticket_price: string;
}

export interface AttendeeStatusRecord {
  registration_id: number;
  status: string;
}
