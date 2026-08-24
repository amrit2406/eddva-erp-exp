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
  role?: Pick<Role, 'role_id' | 'name'>;
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

// Category Types
export interface Category {
  category_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
}

// Membership Rule Types
export interface MembershipRule {
  rule_id: number;
  member_type: string;
  max_books_allowed: number;
  loan_period_days: number;
  fine_per_day: number;
  grace_period_days: number;
  max_fine_cap: number;
  created_at: string;
  updated_at: string;
}

export interface MembershipRuleFormData {
  member_type: string;
  max_books_allowed: number;
  loan_period_days: number;
  fine_per_day: number;
  grace_period_days: number;
  max_fine_cap: number;
}

// Member Types
export interface Member {
  member_id: number;
  external_ref_id: string;
  name: string;
  member_type: string;
  created_at: string;
  updated_at: string;
}

export interface MemberFormData {
  external_ref_id: string;
  name: string;
  member_type: string;
}

export interface BookIssue {
  issue_id: number;
  book_id: number;
  book_title: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: string;
}

export interface Fine {
  fine_id: number;
  amount: number;
  reason: string;
  created_at: string;
  paid: boolean;
}

// Book Types
export interface Book {
  book_id: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  edition: string;
  category_id: number;
  language: string;
  publish_year: number;
  description: string;
  cover_image_url?: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    category_id: number;
    name: string;
  };
  _count?: {
    copies: number;
  };
}

export interface BookFormData {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  edition: string;
  category_id: number;
  language: string;
  publish_year: number;
  description: string;
}
