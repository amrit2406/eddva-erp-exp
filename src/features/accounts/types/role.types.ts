export interface AccountsPermissionEntry {
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

export interface AccountsPermissionResourceGroup {
  resource: string;
  name: string;
  available_actions: string[];
  permissions: AccountsPermissionEntry[];
}

export interface AccountsPermissionCatalog {
  total: number;
  resources: AccountsPermissionResourceGroup[];
  all_permissions: AccountsPermissionEntry[];
}

export interface AccountsRolePermissionRule {
  resource: string;
  actions: string[];
}

export type AccountsMyPermissions = AccountsRolePermissionRule[];

export interface AccountsPermissionFormData {
  resource: string;
  action: string;
  name: string;
  category: string;
  description?: string;
  is_active?: boolean;
}

export interface AccountsRole {
  role_id: number;
  institute_id: string;
  name: string;
  description?: string | null;
  permissions: AccountsRolePermissionRule[];
  created_at: string;
  updated_at: string;
  _count?: { user_roles: number };
  user_roles?: AccountsUserAssignment[];
}

export interface AccountsRoleFormData {
  name: string;
  description?: string;
  permissions: AccountsRolePermissionRule[];
}

export type AccountsRoleUpdateData = Partial<AccountsRoleFormData>;

export interface AccountsUserAssignment {
  id: number;
  institute_id: string;
  eddva_user_id: string;
  user_name: string;
  user_email?: string | null;
  username: string;
  is_active: boolean;
  role_id: number;
  assigned_at: string;
  role?: AccountsRole;
}

export interface AssignAccountsUserFormData {
  eddva_user_id: string;
  user_name: string;
  user_email?: string;
  username: string;
  password: string;
  role_id: number;
}

export interface ResetAccountsPasswordFormData {
  new_password: string;
}
