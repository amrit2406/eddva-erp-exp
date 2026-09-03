import axiosInstance from '../../../lib/axios';
import type {
  TransportPermissionCatalog,
  TransportMyPermissions,
  TransportPermissionEntry,
  TransportPermissionFormData,
  TransportRole,
  TransportRoleFormData,
  TransportRoleUpdateData,
  TransportUserAssignment,
  AssignTransportUserFormData,
  ResetTransportPasswordFormData,
} from '../types/role.types';

export async function getPermissionsCatalog(): Promise<TransportPermissionCatalog> {
  const response = await axiosInstance.get('/transport/roles/permissions/catalog');
  return response.data.data || response.data;
}

export async function getMyPermissions(): Promise<TransportMyPermissions> {
  const response = await axiosInstance.get('/transport/roles/permissions/me');
  return response.data.data || response.data || [];
}

// Dynamic Permissions Registry Endpoints
export async function getPermissions(): Promise<TransportPermissionEntry[]> {
  const response = await axiosInstance.get('/transport/permissions');
  // This endpoint returns the same catalog shape as the roles/permissions/catalog endpoint
  if (response.data.data?.all_permissions) {
    return response.data.data.all_permissions;
  }
  if (response.data.all_permissions) {
    return response.data.all_permissions;
  }
  return response.data.data || response.data || [];
}

export async function createPermission(data: TransportPermissionFormData): Promise<TransportPermissionEntry> {
  const response = await axiosInstance.post('/transport/permissions', data);
  return response.data.data || response.data;
}

export async function getPermission(id: string | number): Promise<TransportPermissionEntry> {
  const response = await axiosInstance.get(`/transport/permissions/${id}`);
  return response.data.data || response.data;
}

export async function updatePermission(
  id: string | number,
  data: Partial<TransportPermissionFormData>
): Promise<TransportPermissionEntry> {
  const response = await axiosInstance.patch(`/transport/permissions/${id}`, data);
  return response.data.data || response.data;
}

export async function deletePermission(id: string | number): Promise<void> {
  await axiosInstance.delete(`/transport/permissions/${id}`);
}

export async function getRoles(): Promise<TransportRole[]> {
  const response = await axiosInstance.get('/transport/roles');
  return response.data.data || response.data || [];
}

export async function getRole(id: string | number): Promise<TransportRole> {
  const response = await axiosInstance.get(`/transport/roles/${id}`);
  return response.data.data || response.data;
}

export async function createRole(data: TransportRoleFormData): Promise<TransportRole> {
  const response = await axiosInstance.post('/transport/roles', data);
  return response.data.data || response.data;
}

export async function updateRole(id: string | number, data: TransportRoleUpdateData): Promise<TransportRole> {
  const response = await axiosInstance.patch(`/transport/roles/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteRole(id: string | number): Promise<void> {
  await axiosInstance.delete(`/transport/roles/${id}`);
}

export async function getUserAssignments(): Promise<TransportUserAssignment[]> {
  const response = await axiosInstance.get('/transport/roles/user-assignments');
  return response.data.data || response.data || [];
}

export async function createUserAssignment(data: AssignTransportUserFormData): Promise<TransportUserAssignment> {
  const response = await axiosInstance.post('/transport/roles/user-assignments', data);
  return response.data.data || response.data;
}

export async function resetUserAssignmentPassword(
  assignmentId: string | number,
  data: ResetTransportPasswordFormData
): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.patch(`/transport/roles/user-assignments/${assignmentId}/password`, data);
  return response.data.data || response.data;
}

export async function revokeUserAssignment(assignmentId: string | number): Promise<void> {
  await axiosInstance.delete(`/transport/roles/user-assignments/${assignmentId}`);
}
