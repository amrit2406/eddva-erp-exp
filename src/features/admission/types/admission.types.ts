// Admission Platform Auth (independent auth island, decoupled from the core User table)
export interface AdmissionPlatformUser {
  id: string;
  institute_id: string;
  user_name: string;
  user_email?: string;
  user_role: string;
  is_institute_admin: boolean;
}

export interface AdmissionLoginCredentials {
  username: string;
  password: string;
  // Only needed when the same username exists in more than one institute
  institute_id?: string;
}

// RBAC Types
export interface Permission {
  permission_id: number;
  key: string;
  resource: string;
  action: string;
  name: string;
  category: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionFormData {
  resource: string;
  action: string;
  name: string;
  category: string;
  description: string;
  is_active?: boolean;
}

export interface PermissionResource {
  resource: string;
  name: string;
  available_actions: string[];
  permissions: Permission[];
}

export interface PermissionsCatalog {
  total: number;
  resources: PermissionResource[];
  all_permissions: Permission[];
}

export interface RolePermission {
  resource: string;
  actions: string[];
}

export interface Role {
  role_id: number;
  institute_id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  created_at: string;
  updated_at: string;
  _count?: {
    user_roles: number;
  };
}

export interface RoleFormData {
  name: string;
  description: string;
  permissions: RolePermission[];
}

export interface UserAssignment {
  id: number;
  eddva_user_id: string;
  user_name: string;
  user_email: string;
  username: string;
  role_id: number;
  is_active?: boolean;
  role?: Pick<Role, 'role_id' | 'name'>;
  assigned_at?: string;
}

export interface UserAssignmentFormData {
  eddva_user_id: string;
  user_name: string;
  user_email: string;
  username: string;
  password: string;
  role_id: number;
}

export interface ResetPasswordFormData {
  new_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Shared list types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Academic Sessions
export type SessionStatus = 'upcoming' | 'active' | 'closed';

export const SESSION_STATUSES: SessionStatus[] = ['upcoming', 'active', 'closed'];

export interface AdmissionSession {
  session_id: number;
  institute_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: SessionStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionFormData {
  name: string;
  start_date: string;
  end_date: string;
  status: SessionStatus;
}

export interface SessionListParams extends ListParams {
  status?: SessionStatus | '';
}

// Programs
export interface AdmissionProgram {
  program_id: number;
  institute_id: string;
  name: string;
  level: string;
  total_seats: number;
  eligibility_criteria: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramFormData {
  name: string;
  level: string;
  total_seats: number;
  eligibility_criteria: string;
}

// Applicants
export type ApplicantGender = 'male' | 'female' | 'other';

export const APPLICANT_GENDERS: ApplicantGender[] = ['male', 'female', 'other'];

export interface Applicant {
  applicant_id: number;
  institute_id: string;
  name: string;
  dob: string;
  gender: ApplicantGender;
  email: string | null;
  phone: string | null;
  address: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  photo_url: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicantFormData {
  name: string;
  dob: string;
  gender: ApplicantGender;
  email: string;
  phone: string;
  address: string;
  guardian_name: string;
  guardian_contact: string;
  photo_url: string;
}

// Enquiries & Leads
export type EnquiryStatus = 'new' | 'contacted' | 'follow_up' | 'converted' | 'lost';
export type EnquirySource = 'walk_in' | 'phone' | 'website' | 'referral' | 'social_media' | 'other';

export const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'contacted', 'follow_up', 'converted', 'lost'];
// "converted" is reached through the convert action, not a manual status change.
export const ENQUIRY_MANUAL_STATUSES: EnquiryStatus[] = ENQUIRY_STATUSES.filter((s) => s !== 'converted');
export const ENQUIRY_SOURCES: EnquirySource[] = ['walk_in', 'phone', 'website', 'referral', 'social_media', 'other'];

export interface Enquiry {
  enquiry_id: number;
  institute_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  program_id: number | null;
  source: EnquirySource;
  status: EnquiryStatus;
  assigned_to: string | null;
  program?: Pick<AdmissionProgram, 'program_id' | 'name'> | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EnquiryFormData {
  name: string;
  phone: string;
  email: string;
  program_id: number | '';
  source: EnquirySource;
  assigned_to: string;
}

export interface EnquiryListParams extends ListParams {
  status?: EnquiryStatus | '';
  source?: EnquirySource | '';
}

export interface EnquiryFollowup {
  followup_id: number;
  enquiry_id: number;
  notes: string;
  followup_date: string;
  next_followup_date: string | null;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface FollowupFormData {
  notes: string;
  followup_date: string;
  next_followup_date: string;
}

export interface ConvertApplicantDetails {
  dob: string;
  gender: ApplicantGender;
  address?: string;
  guardian_name?: string;
  guardian_contact?: string;
  photo_url?: string;
}

// Link an existing applicant (applicant_id) or create one from applicant_details.
export interface ConvertEnquiryData {
  session_id: number;
  program_id: number;
  applicant_id?: number;
  applicant_details?: ConvertApplicantDetails;
  application_date: string;
}

// Applications
export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'waitlisted'
  | 'withdrawn';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'waitlisted',
  'withdrawn',
];

export interface Application {
  application_id: number;
  institute_id: string;
  applicant_id: number;
  session_id: number;
  program_id: number;
  application_date: string;
  status: ApplicationStatus;
  source_enquiry_id: number | null;
  applicant?: Pick<Applicant, 'applicant_id' | 'name' | 'dob' | 'gender' | 'guardian_name'> | null;
  session?: Pick<AdmissionSession, 'session_id' | 'name'> | null;
  program?: Pick<AdmissionProgram, 'program_id' | 'name'> | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Link an existing applicant (applicant_id) or create one inline (applicant).
export interface ApplicationCreateData {
  applicant_id?: number;
  applicant?: ApplicantFormData;
  session_id: number;
  program_id: number;
  application_date: string;
  source_enquiry_id?: number;
}

export interface ApplicationUpdateData {
  session_id: number;
  program_id: number;
  application_date: string;
}

export interface ApplicationListParams extends ListParams {
  status?: ApplicationStatus | '';
  session_id?: number | '';
  program_id?: number | '';
}

// The history/activity payload shapes aren't pinned down, so the fields the
// UI reads are optional and the components fall back between likely names.
export interface ApplicationStatusChange {
  history_id?: number;
  id?: number;
  from_status?: ApplicationStatus | null;
  to_status?: ApplicationStatus;
  status?: ApplicationStatus;
  reason?: string | null;
  changed_by?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface ApplicationActivity {
  activity_id?: number;
  id?: number;
  action?: string;
  type?: string;
  description?: string | null;
  message?: string | null;
  performed_by?: string | null;
  created_by?: string | null;
  created_at: string;
}

// Application Documents
export type DocumentStatus = 'pending' | 'verified' | 'rejected';

export const DOCUMENT_STATUSES: DocumentStatus[] = ['pending', 'verified', 'rejected'];

export interface ApplicationDocument {
  document_id: number;
  application_id: number;
  document_type: string;
  file_name: string | null;
  mime_type: string | null;
  file_size: number | null;
  status: DocumentStatus;
  rejection_reason: string | null;
  verified_by?: string | null;
  verified_at?: string | null;
  uploaded_by?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DocumentUploadData {
  document_type: string;
  file: File;
}

// Application Fee
export type PaymentMode = 'cash' | 'card' | 'upi' | 'net_banking' | 'cheque' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export const PAYMENT_MODES: PaymentMode[] = ['cash', 'card', 'upi', 'net_banking', 'cheque', 'bank_transfer'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'success', 'failed'];

export interface ApplicationFeePayment {
  payment_id: number;
  application_id: number;
  // Decimal columns often serialise as strings, so always read via Number().
  amount: number | string;
  payment_date: string;
  payment_mode: PaymentMode;
  transaction_ref: string | null;
  status: PaymentStatus;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface FeePaymentFormData {
  amount: number | '';
  payment_date: string;
  payment_mode: PaymentMode;
  transaction_ref: string;
  status: PaymentStatus;
}

export interface FeePaymentUpdateData {
  status?: PaymentStatus;
  transaction_ref?: string;
}

// Entrance Tests
export type TestMode = 'online' | 'offline';
export type RegistrationStatus = 'registered' | 'appeared' | 'absent';

export const TEST_MODES: TestMode[] = ['online', 'offline'];
export const REGISTRATION_STATUSES: RegistrationStatus[] = ['registered', 'appeared', 'absent'];

export interface EntranceTest {
  test_id: number;
  institute_id: string;
  name: string;
  session_id: number;
  program_id: number;
  test_date: string;
  mode: TestMode;
  venue: string | null;
  // Decimal columns often serialise as strings, so always read via Number().
  max_marks: number | string;
  session?: Pick<AdmissionSession, 'session_id' | 'name'> | null;
  program?: Pick<AdmissionProgram, 'program_id' | 'name'> | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TestFormData {
  name: string;
  session_id: number | '';
  program_id: number | '';
  // <input type="datetime-local"> value (local time); converted to ISO on send.
  test_date: string;
  mode: TestMode;
  venue: string;
  max_marks: number | '';
}

export interface TestListParams extends ListParams {
  session_id?: number | '';
  program_id?: number | '';
  mode?: TestMode | '';
}

export interface TestRegistration {
  registration_id: number;
  test_id: number;
  application_id: number;
  status: RegistrationStatus;
  application?: {
    application_id: number;
    applicant?: Pick<Applicant, 'applicant_id' | 'name'> | null;
  } | null;
  created_at?: string;
}

export interface TestResult {
  result_id?: number;
  application_id: number;
  marks_obtained: number | string;
}

export interface TestResultEntry {
  application_id: number;
  marks_obtained: number;
}

// Interviews
export type InterviewMode = 'online' | 'offline';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type InterviewRecommendation = 'recommend' | 'hold' | 'not_recommend';

export const INTERVIEW_MODES: InterviewMode[] = ['online', 'offline'];
export const INTERVIEW_STATUSES: InterviewStatus[] = ['scheduled', 'completed', 'cancelled', 'no_show'];
export const INTERVIEW_RECOMMENDATIONS: InterviewRecommendation[] = ['recommend', 'hold', 'not_recommend'];

export interface InterviewEvaluation {
  score: number | string | null;
  remarks: string | null;
  recommendation: InterviewRecommendation | null;
}

export interface Interview {
  interview_id: number;
  institute_id: string;
  application_id: number;
  scheduled_datetime: string;
  mode: InterviewMode;
  venue_or_link: string | null;
  panelist_ids: string[];
  status: InterviewStatus;
  application?: {
    application_id: number;
    applicant?: Pick<Applicant, 'applicant_id' | 'name'> | null;
  } | null;
  // Where the evaluation lives isn't pinned down: read the nested object, then the flat fields.
  evaluation?: InterviewEvaluation | null;
  score?: number | string | null;
  remarks?: string | null;
  recommendation?: InterviewRecommendation | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewFormData {
  application_id: number | '';
  // <input type="datetime-local"> value (local time); converted to ISO on send.
  scheduled_datetime: string;
  mode: InterviewMode;
  venue_or_link: string;
  panelist_ids: string[];
}

export interface InterviewListParams extends ListParams {
  status?: InterviewStatus | '';
  mode?: InterviewMode | '';
}

export interface EvaluationFormData {
  score: number | '';
  remarks: string;
  recommendation: InterviewRecommendation;
}

// Merit Lists
export type MeritOutcome = 'selected' | 'waitlisted' | 'rejected';
export type MeritListStatus = 'draft' | 'published';

export const MERIT_OUTCOMES: MeritOutcome[] = ['selected', 'waitlisted', 'rejected'];

export interface MeritEntry {
  application_id: number;
  rank: number;
  category: string | null;
  outcome: MeritOutcome;
  application?: {
    application_id: number;
    applicant?: Pick<Applicant, 'applicant_id' | 'name'> | null;
  } | null;
}

export interface MeritList {
  merit_list_id: number;
  institute_id: string;
  name: string;
  session_id: number;
  program_id: number;
  criteria_description: string | null;
  status: MeritListStatus;
  published_at?: string | null;
  entries?: MeritEntry[];
  _count?: { entries: number };
  session?: Pick<AdmissionSession, 'session_id' | 'name'> | null;
  program?: Pick<AdmissionProgram, 'program_id' | 'name'> | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MeritListFormData {
  name: string;
  session_id: number | '';
  program_id: number | '';
  criteria_description: string;
}

export interface MeritListParams extends ListParams {
  session_id?: number | '';
  program_id?: number | '';
  status?: MeritListStatus | '';
}

// An entry while it is being edited: rank may be blank mid-edit, and the
// applicant's name is kept for display.
export interface MeritEntryDraft {
  application_id: number;
  name: string;
  rank: number | '';
  category: string;
  outcome: MeritOutcome;
}

export interface MeritEntryPayload {
  application_id: number;
  rank: number;
  category?: string;
  outcome: MeritOutcome;
}

// Fee Structures
export interface FeeStructure {
  fee_structure_id: number;
  institute_id: string;
  program_id: number;
  session_id: number;
  // Decimal columns often serialise as strings, so always read via Number().
  amount: number | string;
  due_date: string;
  program?: Pick<AdmissionProgram, 'program_id' | 'name'> | null;
  session?: Pick<AdmissionSession, 'session_id' | 'name'> | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FeeStructureFormData {
  program_id: number | '';
  session_id: number | '';
  amount: number | '';
  due_date: string;
}

export interface FeeStructureListParams extends ListParams {
  session_id?: number | '';
  program_id?: number | '';
}

// Offers
export type OfferStatus = 'issued' | 'accepted' | 'declined' | 'expired';

export const OFFER_STATUSES: OfferStatus[] = ['issued', 'accepted', 'declined', 'expired'];

export interface Offer {
  offer_id: number;
  institute_id: string;
  application_id: number;
  offer_date: string;
  offer_expiry_date: string;
  seat_category: string | null;
  status: OfferStatus;
  decline_reason?: string | null;
  responded_at?: string | null;
  application?: {
    application_id: number;
    applicant?: Pick<Applicant, 'applicant_id' | 'name'> | null;
    program?: Pick<AdmissionProgram, 'program_id' | 'name'> | null;
    session?: Pick<AdmissionSession, 'session_id' | 'name'> | null;
  } | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface OfferFormData {
  // <input type="datetime-local"> value (local time); converted to ISO on send.
  offer_expiry_date: string;
  seat_category: string;
}

export interface OfferListParams extends ListParams {
  status?: OfferStatus | '';
}

// Admission Fee Payments (recorded once; there is no update endpoint)
export interface AdmissionPayment {
  payment_id: number;
  application_id: number;
  // Decimal columns often serialise as strings, so always read via Number().
  amount_paid: number | string;
  payment_date: string;
  payment_mode: PaymentMode;
  transaction_ref: string | null;
  application?: {
    application_id: number;
    applicant?: Pick<Applicant, 'applicant_id' | 'name'> | null;
    program?: Pick<AdmissionProgram, 'program_id' | 'name'> | null;
  } | null;
  created_by?: string;
  created_at: string;
}

export interface AdmissionPaymentListParams extends ListParams {
  payment_mode?: PaymentMode | '';
}

// Confirmation
export type ConfirmationStatus = 'confirmed' | 'cancelled';

export const CONFIRMATION_STATUSES: ConfirmationStatus[] = ['confirmed', 'cancelled'];

export interface Confirmation {
  confirmation_id: number;
  institute_id: string;
  application_id: number;
  status: ConfirmationStatus;
  confirmed_at?: string | null;
  cancel_reason?: string | null;
  cancelled_at?: string | null;
  student_ref: string | null;
  application?: {
    application_id: number;
    applicant?: Pick<Applicant, 'applicant_id' | 'name'> | null;
    program?: Pick<AdmissionProgram, 'program_id' | 'name'> | null;
    session?: Pick<AdmissionSession, 'session_id' | 'name'> | null;
  } | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ConfirmationListParams extends ListParams {
  status?: ConfirmationStatus | '';
}
