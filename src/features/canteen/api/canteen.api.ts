import axiosInstance from '../../../lib/axios';
import type {
  Permission,
  PermissionFormData,
  Role,
  RoleFormData,
  CanteenUser,
  CanteenUserFormData,
  UsersResponse
} from '../types/canteen.types';

// Role Management Endpoints
export async function getRoles(): Promise<Role[]> {
  const response = await axiosInstance.get('/canteen/roles');
  return response.data.data;
}

export async function getRole(id: string): Promise<Role> {
  const response = await axiosInstance.get(`/canteen/roles/${id}`);
  return response.data.data;
}

export async function createRole(data: RoleFormData): Promise<Role> {
  const response = await axiosInstance.post('/canteen/roles', data);
  return response.data.data;
}

export async function updateRole(id: string, data: Partial<RoleFormData>): Promise<Role> {
  const response = await axiosInstance.patch(`/canteen/roles/${id}`, data);
  return response.data.data;
}

export async function deleteRole(id: string): Promise<void> {
  await axiosInstance.delete(`/canteen/roles/${id}`);
}

export async function getRolePermissions(id: string): Promise<string[]> {
  const response = await axiosInstance.get(`/canteen/roles/${id}/permissions`);
  return response.data.data;
}

export async function updateRolePermissions(id: string, permissionIds: string[]): Promise<void> {
  await axiosInstance.patch(`/canteen/roles/${id}/permissions`, { permissionIds });
}

export async function addPermissionToRole(roleId: string, permissionId: string): Promise<void> {
  await axiosInstance.post(`/canteen/roles/${roleId}/permissions/${permissionId}`);
}

export async function removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
  await axiosInstance.delete(`/canteen/roles/${roleId}/permissions/${permissionId}`);
}

// Permission Management Endpoints
export async function getPermissions(): Promise<Permission[]> {
  const response = await axiosInstance.get('/canteen/permissions');
  return response.data.data;
}

export async function createPermission(data: PermissionFormData): Promise<Permission> {
  const response = await axiosInstance.post('/canteen/permissions', data);
  return response.data.data;
}

export async function getPermission(id: string): Promise<Permission> {
  const response = await axiosInstance.get(`/canteen/permissions/${id}`);
  return response.data.data;
}

export async function updatePermission(id: string, data: Partial<PermissionFormData>): Promise<Permission> {
  const response = await axiosInstance.patch(`/canteen/permissions/${id}`, data);
  return response.data.data;
}

export async function deletePermission(id: string): Promise<void> {
  await axiosInstance.delete(`/canteen/permissions/${id}`);
}

// User Management Endpoints
export async function getUsers(params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<UsersResponse> {
  const response = await axiosInstance.get('/canteen/users', { params });
  return response.data.data;
}

export async function getUser(id: string): Promise<CanteenUser> {
  const response = await axiosInstance.get(`/canteen/users/${id}`);
  return response.data.data;
}

export async function createUser(data: CanteenUserFormData): Promise<CanteenUser> {
  const response = await axiosInstance.post('/canteen/users', data);
  return response.data.data;
}

export async function updateUser(id: string, data: Partial<CanteenUserFormData>): Promise<CanteenUser> {
  const response = await axiosInstance.patch(`/canteen/users/${id}`, data);
  return response.data.data;
}

export async function getUserRoles(userId: string): Promise<any[]> {
  const response = await axiosInstance.get(`/canteen/users/${userId}/roles`);
  return response.data.data;
}

export async function assignRoleToUser(userId: string, roleId: string): Promise<void> {
  await axiosInstance.post(`/canteen/users/${userId}/roles`, { roleId });
}

export async function removeRoleFromUser(userId: string, roleId: string): Promise<void> {
  await axiosInstance.delete(`/canteen/users/${userId}/roles/${roleId}`);
}

export async function deleteUser(id: string): Promise<void> {
  await axiosInstance.delete(`/canteen/users/${id}`);
}
