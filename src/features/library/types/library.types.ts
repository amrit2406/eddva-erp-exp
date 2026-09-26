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
  user_roles?: unknown[];
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
  role?: Pick<Role, 'role_id' | 'name'>;
  is_active?: boolean;
  assigned_at?: string;
  created_at?: string;
  updated_at?: string;
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

// The API sends money as strings ("10.00"); read them with toNumber().
export type Num = number | string;

// Category Types
export interface Category {
  category_id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryFormData {
  name: string;
}

// Membership Rule Types (one rule per member type)
export type MemberType = 'student' | 'staff' | 'faculty';

export interface MembershipRule {
  rule_id: number;
  member_type: MemberType;
  max_books_allowed: number;
  loan_period_days: number;
  fine_per_day: Num;
  grace_period_days: number;
  max_fine_cap: Num | null;
  created_at: string;
  updated_at: string;
}

export interface MembershipRuleFormData {
  member_type: MemberType;
  max_books_allowed: number;
  loan_period_days: number;
  fine_per_day: number;
  grace_period_days: number;
  max_fine_cap: number;
}

// Member Types
export type MemberStatus = 'active' | 'suspended' | 'expired';

export interface Member {
  member_id: number;
  external_ref_id: string | null;
  name: string;
  member_type: MemberType;
  library_card_number: string;
  status: MemberStatus;
  created_at: string;
  updated_at: string;
}

export interface MemberSearchParams {
  search?: string;
  status?: MemberStatus;
  type?: MemberType;
}

export interface MemberFormData {
  external_ref_id?: string;
  name: string;
  member_type: MemberType;
  status?: MemberStatus;
}

// Issue (loan) Types
export type IssueStatus = 'issued' | 'overdue' | 'returned' | 'lost';
export type CopyCondition = 'new' | 'good' | 'worn' | 'damaged';
export type ReturnedCondition = CopyCondition;

export interface BookIssue {
  issue_id: number;
  copy_id: number;
  member_id: number;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  renewal_count: number;
  status: IssueStatus;
  issued_by?: number;
  returned_to?: number | null;
  fine_per_day?: Num;
  grace_period_days?: number;
  max_fine_cap?: Num | null;
  created_at?: string;
  copy?: Partial<BookCopy> & { book?: Partial<Book> & { title: string; author: string } };
  member?: Partial<Member> & { name: string; library_card_number: string };
}

export interface IssueDetail extends BookIssue {
  fines?: Fine[];
}

export interface BookIssueFormData {
  copy_id: number;
  member_id: number;
  issued_by: number;
}

export interface BookIssueReturnData {
  received_by: number;
  returned_to: number;
  returned_condition: ReturnedCondition;
}

export interface BookIssueRenewData {
  renewed_by: number;
}

// Shape the header notification bell expects (the API currently sends
// log_id / event_type / member instead — see NotificationDropdown).
export interface LibraryNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  created_at: string;
  read: boolean;
  link?: string;
}

export interface ReturnIssueResult {
  issue_id?: number;
  returned?: boolean;
  fine?: Fine | null;
  [key: string]: unknown;
}

// Fine Types
export type FineStatus = 'pending' | 'partially_paid' | 'paid' | 'waived';
export type PaymentMode = 'cash' | 'card' | 'upi';

export interface FinePayment {
  payment_id: number;
  fine_id: number;
  amount_paid: Num;
  payment_date: string;
  payment_mode: PaymentMode;
  received_by: number;
  transaction_ref?: string | null;
  created_at: string;
}

export interface Fine {
  fine_id: number;
  issue_id: number;
  member_id: number;
  reason: 'overdue' | 'lost_book' | 'damaged_book';
  amount: Num;
  status: FineStatus;
  calculated_at: string;
  updated_at?: string;
  payments?: FinePayment[];
}

export interface FineWaiveFormData {
  reason: string;
}

export interface FinePayFormData {
  amount_paid: number;
  payment_mode: PaymentMode;
  transaction_ref?: string;
  received_by: number;
}

// Book Types
export interface Book {
  book_id: number;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  edition: string | null;
  category_id: number;
  language: string | null;
  publish_year: number | null;
  description: string | null;
  cover_image_url?: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    category_id: number;
    name: string;
  };
  // Counts only copies that are available to lend right now.
  _count?: {
    copies: number;
  };
}

export interface BookFormData {
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  edition?: string;
  category_id: number;
  language?: string;
  publish_year?: number;
  description?: string;
}

// Book Copy Types
export type CopyStatus = 'available' | 'issued' | 'reserved' | 'lost' | 'under_repair' | 'withdrawn';

export interface BookCopy {
  copy_id: number;
  book_id: number;
  barcode: string;
  accession_number?: string;
  rack_location: string | null;
  condition: CopyCondition;
  acquired_date: string | null;
  price: Num | null;
  status: CopyStatus;
  created_at?: string;
  updated_at?: string;
  current_issue_id?: number | null;
  book?: Partial<Book> & { book_id: number; title: string; author: string };
}

export interface BookCopyFormData {
  barcode: string;
  rack_location?: string;
  condition?: CopyCondition;
  acquired_date?: string;
  price?: number;
}

export interface BookCopyUpdateData extends Partial<BookCopyFormData> {
  status?: CopyStatus;
}

// Book Vendor Types (where a title is bought from)
export interface BookVendor {
  book_vendor_id: number;
  book_id: number;
  vendor_name: string | null;
  name: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  last_purchase_price: Num | null;
  created_at: string;
  updated_at: string;
}

export interface BookVendorFormData {
  vendor_name?: string;
  name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  last_purchase_price?: number;
}

export type BookVendorUpdateData = BookVendorFormData;

// Reservation Types
export type ReservationStatus = 'pending' | 'ready_for_pickup' | 'fulfilled' | 'cancelled' | 'expired';

export interface Reservation {
  reservation_id: number;
  book_id: number;
  member_id: number;
  status: ReservationStatus;
  reserved_date: string;
  expiry_date?: string | null;
  created_at?: string;
  book?: { title: string; author: string };
  member?: { name: string; library_card_number: string };
}

export interface ReservationFormData {
  member_id: number;
}
