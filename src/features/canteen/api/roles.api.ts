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
} from '../types/canteen.types';
import { sanitizeRolePermissions } from '../utils/rbac.utils';

// Permissions Catalog Endpoints
export async function getPermissionsCatalog(): Promise<PermissionsCatalog> {
  const response = await axiosInstance.get('/canteen/roles/permissions/catalog');
  return response.data.data;
}

export async function getMyPermissions(): Promise<RolePermission[]> {
  const response = await axiosInstance.get('/canteen/roles/permissions/me');
  return response.data.data;
}

// Role Management Endpoints
export async function getRoles(): Promise<Role[]> {
  const response = await axiosInstance.get('/canteen/roles');
  return response.data.data;
}

export async function getRole(id: string | number): Promise<Role> {
  const response = await axiosInstance.get(`/canteen/roles/${id}`);
  return response.data.data;
}

export async function createRole(data: RoleFormData): Promise<Role> {
  const response = await axiosInstance.post('/canteen/roles', {
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
  const response = await axiosInstance.patch(`/canteen/roles/${id}`, payload);
  return response.data.data;
}

export async function deleteRole(id: string | number): Promise<void> {
  await axiosInstance.delete(`/canteen/roles/${id}`);
}

// User Assignment Endpoints
export async function getUserAssignments(): Promise<UserAssignment[]> {
  const response = await axiosInstance.get('/canteen/roles/user-assignments');
  return response.data.data;
}

export async function createUserAssignment(data: UserAssignmentFormData): Promise<UserAssignment> {
  const response = await axiosInstance.post('/canteen/roles/user-assignments', data);
  return response.data.data;
}

export async function revokeUserAssignment(id: string | number): Promise<void> {
  await axiosInstance.delete(`/canteen/roles/user-assignments/${id}`);
}

export async function resetUserAssignmentPassword(
  id: string | number,
  data: ResetPasswordFormData
): Promise<ResetPasswordResponse> {
  const response = await axiosInstance.patch(`/canteen/roles/user-assignments/${id}/password`, data);
  return response.data.data;
}

// Dynamic Permissions Registry Endpoints
export async function getPermissions(): Promise<Permission[]> {
  const response = await axiosInstance.get('/canteen/permissions');
  // This endpoint returns the same catalog shape as the roles/permissions/catalog endpoint
  if (response.data.data?.all_permissions) {
    return response.data.data.all_permissions;
  }
  if (response.data.all_permissions) {
    return response.data.all_permissions;
  }
  return response.data.data || response.data || [];
}

export async function getPermission(id: string | number): Promise<Permission> {
  const response = await axiosInstance.get(`/canteen/permissions/${id}`);
  return response.data.data;
}

export async function createPermission(data: PermissionFormData): Promise<Permission> {
  const response = await axiosInstance.post('/canteen/permissions', data);
  return response.data.data;
}

export async function updatePermission(id: string | number, data: Partial<PermissionFormData>): Promise<Permission> {
  const response = await axiosInstance.patch(`/canteen/permissions/${id}`, data);
  return response.data.data;
}

export async function deletePermission(id: string | number): Promise<void> {
  await axiosInstance.delete(`/canteen/permissions/${id}`);
}
