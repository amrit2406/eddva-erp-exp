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
