export interface InventoryPermissionEntry {
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

export interface InventoryPermissionResourceGroup {
  resource: string;
  name: string;
  available_actions: string[];
  permissions: InventoryPermissionEntry[];
}

export interface InventoryPermissionCatalog {
  total: number;
  resources: InventoryPermissionResourceGroup[];
  all_permissions: InventoryPermissionEntry[];
}

export interface InventoryRolePermissionRule {
  resource: string;
  actions: string[];
}

export type InventoryMyPermissions = InventoryRolePermissionRule[];

export interface InventoryRole {
  role_id: number;
  institute_id: string;
  name: string;
  description?: string | null;
  permissions: InventoryRolePermissionRule[];
  created_at: string;
  updated_at: string;
  _count?: { user_roles: number };
  user_roles?: InventoryUserAssignment[];
}

export interface InventoryRoleFormData {
  name: string;
  description?: string;
  permissions: InventoryRolePermissionRule[];
}

export type InventoryRoleUpdateData = Partial<InventoryRoleFormData>;

export interface InventoryUserAssignment {
  id: number;
  institute_id: string;
  eddva_user_id: string;
  user_name: string;
  user_email?: string | null;
  username: string;
  is_active: boolean;
  role_id: number;
  assigned_at: string;
  role?: InventoryRole;
}

export interface AssignInventoryUserFormData {
  eddva_user_id: string;
  user_name: string;
  user_email?: string;
  username: string;
  password: string;
  role_id: number;
}

export interface ResetInventoryPasswordFormData {
  new_password: string;
}
