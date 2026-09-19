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
