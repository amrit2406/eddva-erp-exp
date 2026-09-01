import axiosInstance from '../../../lib/axios';
import type {
  InventoryPermissionCatalog,
  InventoryMyPermissions,
  InventoryPermissionEntry,
  InventoryPermissionFormData,
  InventoryRole,
  InventoryRoleFormData,
  InventoryRoleUpdateData,
  InventoryUserAssignment,
  AssignInventoryUserFormData,
  ResetInventoryPasswordFormData,
} from '../types/role.types';

export async function getPermissionsCatalog(): Promise<InventoryPermissionCatalog> {
  const response = await axiosInstance.get('/inventory/roles/permissions/catalog');
  return response.data.data || response.data;
}

export async function getMyPermissions(): Promise<InventoryMyPermissions> {
  const response = await axiosInstance.get('/inventory/roles/permissions/me');
  return response.data.data || response.data || [];
}

// Dynamic Permissions Registry Endpoints
export async function getPermissions(): Promise<InventoryPermissionEntry[]> {
  const response = await axiosInstance.get('/inventory/permissions');
  // This endpoint returns the same catalog shape as the roles/permissions/catalog endpoint
  if (response.data.data?.all_permissions) {
    return response.data.data.all_permissions;
  }
  if (response.data.all_permissions) {
    return response.data.all_permissions;
  }
  return response.data.data || response.data || [];
}

export async function createPermission(data: InventoryPermissionFormData): Promise<InventoryPermissionEntry> {
  const response = await axiosInstance.post('/inventory/permissions', data);
  return response.data.data || response.data;
}

export async function getPermission(id: string | number): Promise<InventoryPermissionEntry> {
  const response = await axiosInstance.get(`/inventory/permissions/${id}`);
  return response.data.data || response.data;
}

export async function updatePermission(
  id: string | number,
  data: Partial<InventoryPermissionFormData>
): Promise<InventoryPermissionEntry> {
  const response = await axiosInstance.patch(`/inventory/permissions/${id}`, data);
  return response.data.data || response.data;
}

export async function deletePermission(id: string | number): Promise<void> {
  await axiosInstance.delete(`/inventory/permissions/${id}`);
}

export async function getRoles(): Promise<InventoryRole[]> {
  const response = await axiosInstance.get('/inventory/roles');
  return response.data.data || response.data || [];
}

export async function getRole(id: string | number): Promise<InventoryRole> {
  const response = await axiosInstance.get(`/inventory/roles/${id}`);
  return response.data.data || response.data;
}

export async function createRole(data: InventoryRoleFormData): Promise<InventoryRole> {
  const response = await axiosInstance.post('/inventory/roles', data);
  return response.data.data || response.data;
}

export async function updateRole(id: string | number, data: InventoryRoleUpdateData): Promise<InventoryRole> {
  const response = await axiosInstance.patch(`/inventory/roles/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteRole(id: string | number): Promise<void> {
  await axiosInstance.delete(`/inventory/roles/${id}`);
}

export async function getUserAssignments(): Promise<InventoryUserAssignment[]> {
  const response = await axiosInstance.get('/inventory/roles/user-assignments');
  return response.data.data || response.data || [];
}

export async function createUserAssignment(data: AssignInventoryUserFormData): Promise<InventoryUserAssignment> {
  const response = await axiosInstance.post('/inventory/roles/user-assignments', data);
  return response.data.data || response.data;
}

export async function resetUserAssignmentPassword(
  assignmentId: string | number,
  data: ResetInventoryPasswordFormData
): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.patch(`/inventory/roles/user-assignments/${assignmentId}/password`, data);
  return response.data.data || response.data;
}

export async function revokeUserAssignment(assignmentId: string | number): Promise<void> {
  await axiosInstance.delete(`/inventory/roles/user-assignments/${assignmentId}`);
}
