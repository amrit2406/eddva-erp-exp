export interface HostelPermissionEntry {
  permission_id: number;
  key: string;
  resource: string;
  action: string;
  name: string;
  category: string;
  description?: string | null;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HostelPermissionFormData {
  resource: string;
  action: string;
  name: string;
  category: string;
  description: string;
  is_active?: boolean;
}

export interface HostelPermissionResourceGroup {
  resource: string;
  name: string;
  available_actions: string[];
  permissions: HostelPermissionEntry[];
}

export interface HostelPermissionCatalog {
  total: number;
  resources: HostelPermissionResourceGroup[];
  all_permissions: HostelPermissionEntry[];
}

export interface HostelRolePermissionRule {
  resource: string;
  actions: string[];
}

export type HostelMyPermissions = HostelRolePermissionRule[];

export interface HostelRole {
  role_id: number;
  institute_id: string;
  name: string;
  description?: string | null;
  permissions: HostelRolePermissionRule[];
  created_at: string;
  updated_at: string;
  _count?: { user_roles: number };
  user_roles?: HostelUserAssignment[];
}

export interface HostelRoleFormData {
  name: string;
  description?: string;
  permissions: HostelRolePermissionRule[];
}

export type HostelRoleUpdateData = Partial<HostelRoleFormData>;

export interface HostelUserAssignment {
  id: number;
  institute_id: string;
  eddva_user_id: string;
  user_name: string;
  user_email?: string | null;
  username: string;
  is_active: boolean;
  role_id: number;
  assigned_at: string;
  role?: HostelRole;
}

export interface AssignHostelUserFormData {
  eddva_user_id: string;
  user_name: string;
  user_email?: string;
  username: string;
  password: string;
  role_id: number;
}

export interface ResetHostelPasswordFormData {
  new_password: string;
}
