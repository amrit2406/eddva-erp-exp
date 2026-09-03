export interface TransportPermissionEntry {
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

export interface TransportPermissionResourceGroup {
  resource: string;
  name: string;
  available_actions: string[];
  permissions: TransportPermissionEntry[];
}

export interface TransportPermissionCatalog {
  total: number;
  resources: TransportPermissionResourceGroup[];
  all_permissions: TransportPermissionEntry[];
}

export interface TransportRolePermissionRule {
  resource: string;
  actions: string[];
}

export type TransportMyPermissions = TransportRolePermissionRule[];

export interface TransportPermissionFormData {
  resource: string;
  action: string;
  name: string;
  category: string;
  description?: string;
  is_active?: boolean;
}

export interface TransportRole {
  role_id: number;
  institute_id: string;
  name: string;
  description?: string | null;
  permissions: TransportRolePermissionRule[];
  created_at: string;
  updated_at: string;
  _count?: { user_roles: number };
  user_roles?: TransportUserAssignment[];
}

export interface TransportRoleFormData {
  name: string;
  description?: string;
  permissions: TransportRolePermissionRule[];
}

export type TransportRoleUpdateData = Partial<TransportRoleFormData>;

export interface TransportUserAssignment {
  id: number;
  institute_id: string;
  eddva_user_id: string;
  user_name: string;
  user_email?: string | null;
  username: string;
  is_active: boolean;
  role_id: number;
  assigned_at: string;
  role?: TransportRole;
}

export interface AssignTransportUserFormData {
  eddva_user_id: string;
  user_name: string;
  user_email?: string;
  username: string;
  password: string;
  role_id: number;
}

export interface ResetTransportPasswordFormData {
  new_password: string;
}
