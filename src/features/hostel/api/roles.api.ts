import axiosInstance from '../../../lib/axios';
import type {
  HostelPermissionCatalog,
  HostelPermissionEntry,
  HostelPermissionFormData,
  HostelMyPermissions,
  HostelRole,
  HostelRoleFormData,
  HostelRoleUpdateData,
  HostelUserAssignment,
  AssignHostelUserFormData,
  ResetHostelPasswordFormData,
} from '../types/role.types';

export async function getHostelPermissionsCatalog(): Promise<HostelPermissionCatalog> {
  const response = await axiosInstance.get('/hostel/roles/permissions/catalog');
  return response.data.data || response.data;
}

export async function getHostelMyPermissions(): Promise<HostelMyPermissions> {
  const response = await axiosInstance.get('/hostel/roles/permissions/me');
  return response.data.data || response.data || [];
}

export async function getHostelUserAssignments(): Promise<HostelUserAssignment[]> {
  const response = await axiosInstance.get('/hostel/roles/user-assignments');
  return response.data.data || response.data || [];
}

export async function createHostelUserAssignment(data: AssignHostelUserFormData): Promise<HostelUserAssignment> {
  const response = await axiosInstance.post('/hostel/roles/user-assignments', data);
  return response.data.data || response.data;
}

export async function resetHostelUserAssignmentPassword(
  assignmentId: string | number,
  data: ResetHostelPasswordFormData
): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.patch(`/hostel/roles/user-assignments/${assignmentId}/password`, data);
  return response.data.data || response.data;
}

export async function deleteHostelUserAssignment(assignmentId: string | number): Promise<void> {
  await axiosInstance.delete(`/hostel/roles/user-assignments/${assignmentId}`);
}

export async function getHostelRoles(): Promise<HostelRole[]> {
  const response = await axiosInstance.get('/hostel/roles');
  return response.data.data || response.data || [];
}

export async function getHostelRole(id: string | number): Promise<HostelRole> {
  const response = await axiosInstance.get(`/hostel/roles/${id}`);
  return response.data.data || response.data;
}

export async function createHostelRole(data: HostelRoleFormData): Promise<HostelRole> {
  const response = await axiosInstance.post('/hostel/roles', data);
  return response.data.data || response.data;
}

export async function updateHostelRole(id: string | number, data: HostelRoleUpdateData): Promise<HostelRole> {
  const response = await axiosInstance.patch(`/hostel/roles/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteHostelRole(id: string | number): Promise<void> {
  await axiosInstance.delete(`/hostel/roles/${id}`);
}

// Dynamic Permissions Registry
export async function getHostelPermissions(): Promise<HostelPermissionEntry[]> {
  const response = await axiosInstance.get('/hostel/permissions');
  const payload = response.data.data ?? response.data;
  // The list endpoint may return a bare array or the catalog shape.
  if (Array.isArray(payload)) return payload;
  return payload?.all_permissions ?? [];
}

export async function getHostelPermission(id: string | number): Promise<HostelPermissionEntry> {
  const response = await axiosInstance.get(`/hostel/permissions/${id}`);
  return response.data.data || response.data;
}

export async function createHostelPermission(data: HostelPermissionFormData): Promise<HostelPermissionEntry> {
  const response = await axiosInstance.post('/hostel/permissions', data);
  return response.data.data || response.data;
}

export async function updateHostelPermission(
  id: string | number,
  data: Partial<HostelPermissionFormData>
): Promise<HostelPermissionEntry> {
  const response = await axiosInstance.patch(`/hostel/permissions/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteHostelPermission(id: string | number): Promise<void> {
  await axiosInstance.delete(`/hostel/permissions/${id}`);
}
