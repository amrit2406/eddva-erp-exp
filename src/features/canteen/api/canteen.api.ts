import axiosInstance from '../../../lib/axios';
import type {
  Permission,
  PermissionFormData,
  Role,
  RoleFormData,
  CanteenUser,
  CanteenUserFormData,
  CreateUserFormData,
  UsersResponse
} from '../types/canteen.types';

// Role Management Endpoints
export async function getRoles(params?: { page?: number; limit?: number }): Promise<Role[]> {
  const response = await axiosInstance.get('/canteen/roles', { params });
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
  const response = await axiosInstance.put(`/canteen/permissions/${id}`, data);
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

export async function createUser(data: CreateUserFormData): Promise<CanteenUser> {
  const response = await axiosInstance.post('/canteen/users', data);
  return response.data.data;
}

export async function updateUser(id: string, data: Partial<CanteenUserFormData>): Promise<CanteenUser> {
  const response = await axiosInstance.put(`/canteen/users/${id}`, data);
  return response.data.data;
}

export async function assignRolesToUser(userId: string, roleIds: string[]): Promise<void> {
  await axiosInstance.post(`/canteen/users/${userId}/roles`, { roleIds });
}

export async function removeRoleFromUser(userId: string, roleId: string): Promise<void> {
  await axiosInstance.delete(`/canteen/users/${userId}/roles/${roleId}`);
}

export async function activateUser(id: string): Promise<void> {
  await axiosInstance.put(`/canteen/users/${id}/activate`);
}

export async function deactivateUser(id: string): Promise<void> {
  await axiosInstance.put(`/canteen/users/${id}/deactivate`);
}

export async function deleteUser(id: string): Promise<void> {
  await axiosInstance.delete(`/canteen/users/${id}`);
}
