export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Responses whose exact shape isn't confirmed yet (public directory,
// verification history, duplicates, groups, notifications, ...) are rendered
// generically rather than typed field-by-field.
export type GenericRecord = Record<string, unknown>;

export interface ListResult<T = GenericRecord> {
  data: T[];
  pagination?: Pagination;
}

export interface RecordResult {
  data: GenericRecord | GenericRecord[];
  pagination?: Pagination;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Fields shared by the staff "create profile" form and the alumni's own
// "edit my profile" form.
export interface AlumniProfileCore {
  full_name: string;
  email: string;
  student_ref: string;
  admission_no: string;
  batch_year: number;
  graduation_year: number;
  program: string;
  phone: string;
  current_company: string;
  current_designation: string;
  industry: string;
  city: string;
  country: string;
  linkedin_url: string;
  visibility: string;
  contact_visible: boolean;
  email_opt_in: boolean;
  sms_opt_in: boolean;
}

// Staff-only: also sets the initial verification status and a temporary
// portal password.
export interface AlumniProfileFormData extends AlumniProfileCore {
  verification_status: string;
  password: string;
}

// Staff editing an existing profile — same fields as create, minus the
// one-time password (a reset goes through the dedicated account endpoint).
export interface AlumniProfileUpdateData extends AlumniProfileCore {
  verification_status: string;
}

export interface AlumniProfile extends AlumniProfileCore {
  profile_id: number;
  verification_status: string;
  is_active?: boolean;
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AlumniProfileListParams extends ListParams {
  verification_status?: string;
  batch_year?: string;
}
