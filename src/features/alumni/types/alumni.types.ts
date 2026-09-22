// Alumni Platform Auth (independent auth island, decoupled from the core User table)
export interface AlumniPlatformUser {
  id: string;
  institute_id: string;
  user_name: string;
  user_email?: string;
  user_role: string;
  is_institute_admin: boolean;
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

// Staff-only: creates an alumni profile and their portal login together
// (alumni never self-register). The exact profile field set isn't confirmed
// yet, so this stays a loose bag of fields rather than a fixed shape.
export interface AlumniRegisterFormData {
  full_name: string;
  email: string;
  phone: string;
  graduation_year: string;
  program: string;
  username: string;
  password: string;
}

export interface AlumniChangePasswordFormData {
  current_password: string;
  new_password: string;
}
