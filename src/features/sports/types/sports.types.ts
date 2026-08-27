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

// House Management Types
export interface House {
  house_id: number;
  name: string;
  color_code?: string;
  house_master_id?: number;
  motto?: string;
  house_master?: SportsStaff;
  _count?: { memberships: number };
  standings?: HouseStanding[];
  created_at?: string;
  updated_at?: string;
}

export interface HouseFormData {
  name: string;
  color_code?: string;
  house_master_id?: number;
  motto?: string;
}

export type HouseMembershipStatus = 'active' | 'transferred';

export interface HouseMembership {
  membership_id: number;
  house_id: number;
  participant_id: number;
  academic_year: string;
  status: HouseMembershipStatus;
  created_at: string;
  participant?: SportsParticipant;
  house?: House;
}

export interface AddHouseMemberFormData {
  participant_id: number;
  academic_year: string;
  status?: HouseMembershipStatus;
}

export type HousePointSourceType = 'tournament_result' | 'discipline' | 'participation' | 'other';

export interface HousePoint {
  point_id: number;
  house_id: number;
  points: number;
  source_type: HousePointSourceType;
  source_reference_id?: number;
  reason?: string;
  awarded_date: string;
  awarded_by?: number;
  created_at: string;
  awarder_user?: { user_id: number; staff?: SportsStaff } | null;
}

export interface AwardHousePointsFormData {
  points: number;
  source_type: HousePointSourceType;
  source_reference_id?: number;
  reason?: string;
  awarded_date: string;
  academic_year: string;
}

export interface HouseStanding {
  house_id: number;
  academic_year: string;
  total_points: number;
  rank?: number;
  last_updated_at: string;
  house?: House;
}
