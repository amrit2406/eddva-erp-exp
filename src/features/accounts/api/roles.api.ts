import axiosInstance from '../../../lib/axios';
import type {
  AccountsPermissionCatalog,
  AccountsMyPermissions,
  AccountsRole,
  AccountsRoleFormData,
  AccountsRoleUpdateData,
  AccountsUserAssignment,
  AssignAccountsUserFormData,
  ResetAccountsPasswordFormData,
} from '../types/role.types';

export async function getPermissionsCatalog(): Promise<AccountsPermissionCatalog> {
  const response = await axiosInstance.get('/accounts/roles/permissions/catalog');
  return response.data.data || response.data;
}

export async function getMyPermissions(): Promise<AccountsMyPermissions> {
  const response = await axiosInstance.get('/accounts/roles/permissions/me');
  return response.data.data || response.data || [];
}

export async function getRoles(): Promise<AccountsRole[]> {
  const response = await axiosInstance.get('/accounts/roles');
  return response.data.data || response.data || [];
}

export async function getRole(id: string | number): Promise<AccountsRole> {
  const response = await axiosInstance.get(`/accounts/roles/${id}`);
  return response.data.data || response.data;
}

export async function createRole(data: AccountsRoleFormData): Promise<AccountsRole> {
  const response = await axiosInstance.post('/accounts/roles', data);
  return response.data.data || response.data;
}

export async function updateRole(id: string | number, data: AccountsRoleUpdateData): Promise<AccountsRole> {
  const response = await axiosInstance.patch(`/accounts/roles/${id}`, data);
  return response.data.data || response.data;
}

export async function deleteRole(id: string | number): Promise<void> {
  await axiosInstance.delete(`/accounts/roles/${id}`);
}

export async function getUserAssignments(): Promise<AccountsUserAssignment[]> {
  const response = await axiosInstance.get('/accounts/roles/user-assignments');
  return response.data.data || response.data || [];
}

export async function createUserAssignment(data: AssignAccountsUserFormData): Promise<AccountsUserAssignment> {
  const response = await axiosInstance.post('/accounts/roles/user-assignments', data);
  return response.data.data || response.data;
}

export async function resetUserAssignmentPassword(
  assignmentId: string | number,
  data: ResetAccountsPasswordFormData
): Promise<{ success: boolean; message: string }> {
  const response = await axiosInstance.patch(`/accounts/roles/user-assignments/${assignmentId}/password`, data);
  return response.data.data || response.data;
}

export async function revokeUserAssignment(assignmentId: string | number): Promise<void> {
  await axiosInstance.delete(`/accounts/roles/user-assignments/${assignmentId}`);
}
