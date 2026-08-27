import axiosInstance from '../../../lib/axios';
import type {
  Permission,
  PermissionFormData,
  PermissionsCatalog,
  Role,
  RoleFormData,
  RolePermission,
  UserAssignment,
  UserAssignmentFormData,
  ResetPasswordFormData,
  ResetPasswordResponse,
  Sport,
  SportFormData,
  Venue,
  VenueFormData,
  SportsStaff,
  SportsStaffFormData,
  SportsParticipant,
  SportsParticipantFormData,
} from '../types/sports.types';
import { sanitizeRolePermissions } from '../utils/rbac.utils';

// Permissions Catalog Endpoints (used by the role permission picker)
export async function getPermissionsCatalog(): Promise<PermissionsCatalog> {
  const response = await axiosInstance.get('/sports/roles/permissions/catalog');
  return response.data.data;
}

export async function getMyPermissions(): Promise<RolePermission[]> {
  const response = await axiosInstance.get('/sports/roles/permissions/me');
  return response.data.data;
}

// Dynamic Permissions Registry Endpoints
export async function getPermissions(): Promise<Permission[]> {
  const response = await axiosInstance.get('/sports/permissions');
  // This endpoint returns the same catalog shape as the roles/permissions/catalog endpoint
  if (response.data.data?.all_permissions) {
    return response.data.data.all_permissions;
  }
  if (response.data.all_permissions) {
    return response.data.all_permissions;
  }
  // Fallback for a plain array response
  return response.data.data || response.data || [];
}

export async function createPermission(data: PermissionFormData): Promise<Permission> {
  const response = await axiosInstance.post('/sports/permissions', data);
  return response.data.data || response.data;
}

export async function getPermission(id: string | number): Promise<Permission> {
  const response = await axiosInstance.get(`/sports/permissions/${id}`);
  return response.data.data || response.data;
}

export async function updatePermission(id: string | number, data: Partial<PermissionFormData>): Promise<Permission> {
  const response = await axiosInstance.patch(`/sports/permissions/${id}`, data);
  return response.data.data || response.data;
}

export async function deletePermission(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/permissions/${id}`);
}

// Role Management Endpoints
export async function getRoles(): Promise<Role[]> {
  const response = await axiosInstance.get('/sports/roles');
  return response.data.data;
}

export async function getRole(id: string | number): Promise<Role> {
  const response = await axiosInstance.get(`/sports/roles/${id}`);
  return response.data.data;
}

export async function createRole(data: RoleFormData): Promise<Role> {
  const response = await axiosInstance.post('/sports/roles', {
    ...data,
    permissions: sanitizeRolePermissions(data.permissions),
  });
  return response.data.data;
}

export async function updateRole(id: string | number, data: Partial<RoleFormData>): Promise<Role> {
  const payload = { ...data };
  if (data.permissions) {
    payload.permissions = sanitizeRolePermissions(data.permissions);
  }
  const response = await axiosInstance.patch(`/sports/roles/${id}`, payload);
  return response.data.data;
}

export async function deleteRole(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/roles/${id}`);
}

// Sports Catalog Endpoints
export async function getSports(): Promise<Sport[]> {
  const response = await axiosInstance.get('/sports/catalog');
  return response.data.data || response.data || [];
}

export async function getSport(id: string | number): Promise<Sport> {
  const response = await axiosInstance.get(`/sports/catalog/${id}`);
  return response.data.data || response.data;
}

export async function createSport(data: SportFormData): Promise<Sport> {
  const response = await axiosInstance.post('/sports/catalog', data);
  return response.data.data || response.data;
}

export async function updateSport(id: string | number, data: Partial<SportFormData>): Promise<Sport> {
  const response = await axiosInstance.patch(`/sports/catalog/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteSport(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/catalog/${id}`);
}

// Venue Endpoints
export async function getVenues(): Promise<Venue[]> {
  const response = await axiosInstance.get('/sports/venues');
  return response.data.data || response.data || [];
}

export async function getVenue(id: string | number): Promise<Venue> {
  const response = await axiosInstance.get(`/sports/venues/${id}`);
  return response.data.data || response.data;
}

export async function createVenue(data: VenueFormData): Promise<Venue> {
  const response = await axiosInstance.post('/sports/venues', data);
  return response.data.data || response.data;
}

export async function updateVenue(id: string | number, data: Partial<VenueFormData>): Promise<Venue> {
  const response = await axiosInstance.patch(`/sports/venues/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteVenue(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/venues/${id}`);
}

// Staff Endpoints
export async function getStaffList(): Promise<SportsStaff[]> {
  const response = await axiosInstance.get('/sports/staff');
  return response.data.data || response.data || [];
}

export async function getStaffMember(id: string | number): Promise<SportsStaff> {
  const response = await axiosInstance.get(`/sports/staff/${id}`);
  return response.data.data || response.data;
}

export async function createStaffMember(data: SportsStaffFormData): Promise<SportsStaff> {
  const response = await axiosInstance.post('/sports/staff', data);
  return response.data.data || response.data;
}

export async function updateStaffMember(id: string | number, data: Partial<SportsStaffFormData>): Promise<SportsStaff> {
  const response = await axiosInstance.patch(`/sports/staff/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteStaffMember(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/staff/${id}`);
}

// Participant Endpoints
export async function getParticipants(): Promise<SportsParticipant[]> {
  const response = await axiosInstance.get('/sports/participants');
  return response.data.data || response.data || [];
}

export async function getParticipant(id: string | number): Promise<SportsParticipant> {
  const response = await axiosInstance.get(`/sports/participants/${id}`);
  return response.data.data || response.data;
}

export async function createParticipant(data: SportsParticipantFormData): Promise<SportsParticipant> {
  const response = await axiosInstance.post('/sports/participants', data);
  return response.data.data || response.data;
}

export async function updateParticipant(id: string | number, data: Partial<SportsParticipantFormData>): Promise<SportsParticipant> {
  const response = await axiosInstance.patch(`/sports/participants/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteParticipant(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/participants/${id}`);
}

// User Assignment Endpoints
export async function getUserAssignments(): Promise<UserAssignment[]> {
  const response = await axiosInstance.get('/sports/roles/user-assignments');
  return response.data.data;
}

export async function createUserAssignment(data: UserAssignmentFormData): Promise<UserAssignment> {
  const response = await axiosInstance.post('/sports/roles/user-assignments', data);
  return response.data.data;
}

export async function revokeUserAssignment(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sports/roles/user-assignments/${id}`);
}

export async function resetUserAssignmentPassword(
  id: string | number,
  data: ResetPasswordFormData
): Promise<ResetPasswordResponse> {
  const response = await axiosInstance.patch(`/sports/roles/user-assignments/${id}/password`, data);
  return response.data.data;
}
