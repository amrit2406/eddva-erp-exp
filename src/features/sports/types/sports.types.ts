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

// Shared Core Catalog Types
export type SportCategory = 'team' | 'individual';

export interface Sport {
  sport_id: number;
  name: string;
  category: SportCategory;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SportFormData {
  name: string;
  category: SportCategory;
  description?: string;
}

export type VenueType = 'ground' | 'court' | 'pool' | 'hall';

export interface Venue {
  venue_id: number;
  name: string;
  type: VenueType;
  capacity?: number;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VenueFormData {
  name: string;
  type: VenueType;
  capacity?: number;
  location?: string;
}

export interface SportsStaff {
  staff_id: number;
  external_ref_id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SportsStaffFormData {
  external_ref_id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface SportsParticipant {
  participant_id: number;
  external_ref_id?: string;
  name: string;
  class_section?: string;
  photo_url?: string;
  roll_number?: string;
  gender?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SportsParticipantFormData {
  external_ref_id?: string;
  name: string;
  class_section?: string;
  photo_url?: string;
  roll_number?: string;
  gender?: string;
}
