export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResult<T = GenericRecord> {
  data: T[];
  pagination?: Pagination;
}

export interface ListParams {
  page?: number;
  limit?: number;
}

// Occupancy, vacancy, residents and history responses aren't a fixed shape
// yet, so the UI renders them generically.
export type GenericRecord = Record<string, unknown>;

export interface RecordResult {
  data: GenericRecord | GenericRecord[];
  pagination?: Pagination;
}

export type RecordLoader = (params: ListParams) => Promise<RecordResult>;

// Blocks
export interface HostelBlock {
  block_id: number;
  institute_id?: string;
  name: string;
  gender_type: string;
  total_floors: number;
  warden_user_id?: string | null;
  warden_name?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BlockFormData {
  name: string;
  gender_type: string;
  total_floors: number;
  warden_user_id: string;
  description: string;
  is_active: boolean;
}

// Rooms
export interface HostelRoom {
  room_id: number;
  block_id: number;
  block_name?: string | null;
  block?: { name?: string | null } | null;
  room_number: string;
  floor: number;
  room_type: string;
  capacity: number;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoomFormData {
  block_id: string;
  room_number: string;
  floor: number;
  room_type: string;
  capacity: number;
  description: string;
}

export interface RoomListParams extends ListParams {
  block_id?: string;
  floor?: string;
}

// Residents
export interface HostelResident {
  resident_id: number;
  student_ref: string;
  admission_no: string;
  student_name: string;
  gender: string;
  grade?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_email?: string | null;
  admitted_on?: string | null;
  status?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ResidentFormData {
  student_ref: string;
  admission_no: string;
  student_name: string;
  gender: string;
  grade: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  admitted_on: string;
}

export interface ResidentListParams extends ListParams {
  search?: string;
}

export interface AllotmentPayload {
  room_id: number;
  bed_id: number;
  academic_year: string;
  allotment_date: string;
}

export interface TransferPayload {
  room_id: number;
  bed_id: number;
  academic_year: string;
  transfer_date: string;
  reason: string;
}

export interface TransferRequestPayload {
  requested_room_id: number;
  requested_bed_id: number;
  reason: string;
}

export interface VacatePayload {
  vacate_date: string;
  reason: string;
}

// Gate passes
export interface GatePassFormData {
  resident_id: string;
  pass_type: string;
  reason: string;
  destination: string;
  // datetime-local values (no timezone); converted to ISO when sent.
  requested_out_at: string;
  expected_return_at: string;
}

// A scan identifies the resident by any of these; at least one is needed.
export interface ScanPayload {
  resident_id?: number;
  admission_no?: string;
  pass_no?: string;
  remarks?: string;
}

// Attendance
export interface AttendanceParams extends ListParams {
  date?: string;
  session?: string;
}

export interface AttendanceMarkPayload {
  resident_id: number;
  attendance_date: string;
  session: string;
  status: string;
  remarks?: string;
}

export interface BulkAttendanceEntry {
  resident_id: number;
  status: string;
  remarks?: string;
}

export interface BulkAttendancePayload {
  attendance_date: string;
  session: string;
  entries: BulkAttendanceEntry[];
}

// Beds
export interface HostelBed {
  bed_id: number;
  room_id: number;
  bed_number: string;
  status?: string | null;
  is_occupied?: boolean;
  is_active?: boolean;
  room_number?: string | null;
  block_id?: number;
  block_name?: string | null;
  room?: {
    room_number?: string | null;
    block_id?: number;
    block?: { name?: string | null } | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface BedListParams extends ListParams {
  block_id?: string;
  room_id?: string;
}

// Mess menu
export interface MessMenuEntry {
  menu_id: number;
  day_of_week: string;
  meal_type: string;
  items: string[];
  effective_from?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MessMenuFormData {
  day_of_week: string;
  meal_type: string;
  items: string[];
  effective_from: string;
  is_active: boolean;
}

// One meal on one day, however the weekly/day endpoints happen to shape it.
export interface MenuSlot {
  day: string;
  meal: string;
  items: string[];
}

// Visitors
export interface VisitorFormData {
  resident_id: string;
  visitor_name: string;
  relation: string;
  id_proof_type: string;
  id_proof_number: string;
  purpose: string;
  // datetime-local value (no timezone); converted to ISO when sent. Blank = now.
  in_time: string;
}

// Mess attendance
export interface MessAttendanceFormData {
  resident_id: string;
  meal_date: string;
  meal_type: string;
  status: string;
}

export interface MessBulkPayload {
  meal_date: string;
  meal_type: string;
  entries: { resident_id: number; status: string }[];
}

export interface MessAttendanceParams extends ListParams {
  date?: string;
  meal_type?: string;
}

// Complaints & maintenance
export interface ComplaintFormData {
  resident_id: string;
  room_id: string;
  category: string;
  description: string;
  priority: string;
}

export interface ComplaintEditData {
  category: string;
  description: string;
  priority: string;
}

export interface ComplaintParams extends ListParams {
  status?: string;
  priority?: string;
  category?: string;
}

// Fee plans
export interface FeePlan {
  fee_plan_id: number;
  name: string;
  room_type: string;
  includes_mess: boolean;
  // Decimal columns often serialise as strings, so always read via Number().
  amount: number | string;
  billing_cycle: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FeePlanFormData {
  name: string;
  room_type: string;
  includes_mess: boolean;
  amount: number;
  billing_cycle: string;
  description: string;
  is_active: boolean;
}

export interface FeePlanParams extends ListParams {
  room_type?: string;
  is_active?: string;
}

// Fee invoices
export interface InvoiceFormData {
  resident_id: string;
  fee_plan_id: string;
  billing_period_start: string;
  due_date: string;
  remarks: string;
}

export interface InvoicePaymentFormData {
  amount_paid: number;
  payment_date: string;
  payment_mode: string;
  transaction_ref: string;
  remarks: string;
}

// Discipline
export interface DisciplineFormData {
  resident_id: string;
  incident_date: string;
  category: string;
  description: string;
  action_taken: string;
  fine_amount: string;
  gate_pass_id: string;
}
