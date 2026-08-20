import axiosInstance from '../../../lib/axios';
import type {
  Permission,
  PermissionFormData,
  Role,
  RoleFormData,
  CanteenUser,
  CanteenUserFormData,
  CreateUserFormData,
  UsersResponse,
  MenuCategory,
  MenuCategoryFormData,
  MenuItem,
  MenuItemFormData,
  MenuItemAvailability,
  MenuSchedule,
  MenuScheduleFormData,
  CanteenMember,
  CanteenMemberFormData,
  PosTerminal,
  PosTerminalFormData,
  Shift,
  OpenShiftFormData,
  CloseShiftFormData,
  Order,
  OrderFormData
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

// Menu Category Endpoints
export async function getMenuCategories(params?: { page?: number; limit?: number }): Promise<MenuCategory[]> {
  const response = await axiosInstance.get('/canteen/menu/categories', { params });
  return response.data.data;
}

export async function getMenuCategory(id: string): Promise<MenuCategory> {
  const response = await axiosInstance.get(`/canteen/menu/categories/${id}`);
  return response.data.data;
}

export async function createMenuCategory(data: MenuCategoryFormData): Promise<MenuCategory> {
  const response = await axiosInstance.post('/canteen/menu/categories', data);
  return response.data.data;
}

export async function updateMenuCategory(id: string, data: Partial<MenuCategoryFormData>): Promise<MenuCategory> {
  const response = await axiosInstance.patch(`/canteen/menu/categories/${id}`, data);
  return response.data.data;
}

export async function deleteMenuCategory(id: string): Promise<void> {
  await axiosInstance.delete(`/canteen/menu/categories/${id}`);
}

// Menu Item Endpoints
export async function getMenuItems(params?: { page?: number; limit?: number; categoryId?: string }): Promise<MenuItem[]> {
  const response = await axiosInstance.get('/canteen/menu/items', { params });
  return response.data.data;
}

export async function getMenuItem(id: string): Promise<MenuItem> {
  const response = await axiosInstance.get(`/canteen/menu/items/${id}`);
  return response.data.data;
}

export async function createMenuItem(data: MenuItemFormData): Promise<MenuItem> {
  const response = await axiosInstance.post('/canteen/menu/items', data);
  return response.data.data;
}

export async function updateMenuItem(id: string, data: Partial<MenuItemFormData>): Promise<MenuItem> {
  const response = await axiosInstance.patch(`/canteen/menu/items/${id}`, data);
  return response.data.data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await axiosInstance.delete(`/canteen/menu/items/${id}`);
}

export async function updateMenuItemAvailability(id: string, data: MenuItemAvailability): Promise<MenuItem> {
  const response = await axiosInstance.patch(`/canteen/menu/items/${id}/availability`, data);
  return response.data.data;
}

// Menu Schedule Endpoints
export async function getItemSchedules(itemId: string, params?: { page?: number; limit?: number }): Promise<MenuSchedule[]> {
  const response = await axiosInstance.get(`/canteen/menu/items/${itemId}/schedules`, { params });
  return response.data.data;
}

export async function createItemSchedule(itemId: string, data: MenuScheduleFormData): Promise<MenuSchedule> {
  const response = await axiosInstance.post(`/canteen/menu/items/${itemId}/schedules`, data);
  return response.data.data;
}

export async function getMenuSchedule(id: string): Promise<MenuSchedule> {
  const response = await axiosInstance.get(`/canteen/menu/schedules/${id}`);
  return response.data.data;
}

export async function updateMenuSchedule(id: string, data: Partial<MenuScheduleFormData>): Promise<MenuSchedule> {
  const response = await axiosInstance.patch(`/canteen/menu/schedules/${id}`, data);
  return response.data.data;
}

export async function deleteMenuSchedule(id: string): Promise<void> {
  await axiosInstance.delete(`/canteen/menu/schedules/${id}`);
}

// Member Management Endpoints
export async function getMembers(params?: { page?: number; limit?: number }): Promise<CanteenMember[]> {
  const response = await axiosInstance.get('/canteen/members', { params });
  return response.data.data;
}

export async function getMember(id: string): Promise<CanteenMember> {
  const response = await axiosInstance.get(`/canteen/members/${id}`);
  return response.data.data;
}

export async function getMemberByBarcode(barcode: string): Promise<CanteenMember> {
  const response = await axiosInstance.get(`/canteen/members/barcode/${barcode}`);
  return response.data.data;
}

export async function createMember(data: CanteenMemberFormData): Promise<CanteenMember> {
  const response = await axiosInstance.post('/canteen/members', data);
  return response.data.data;
}

export async function updateMember(id: string, data: Partial<CanteenMemberFormData>): Promise<CanteenMember> {
  const response = await axiosInstance.patch(`/canteen/members/${id}`, data);
  return response.data.data;
}

export async function deleteMember(id: string): Promise<void> {
  await axiosInstance.delete(`/canteen/members/${id}`);
}

// POS Terminal Endpoints
export async function getPosTerminals(params?: { page?: number; limit?: number }): Promise<PosTerminal[]> {
  const response = await axiosInstance.get('/canteen/pos-terminals', { params });
  return response.data.data;
}

export async function getPosTerminal(id: string): Promise<PosTerminal> {
  const response = await axiosInstance.get(`/canteen/pos-terminals/${id}`);
  return response.data.data;
}

export async function createPosTerminal(data: PosTerminalFormData): Promise<PosTerminal> {
  const response = await axiosInstance.post('/canteen/pos-terminals', data);
  return response.data.data;
}

export async function updatePosTerminal(id: string, data: Partial<PosTerminalFormData>): Promise<PosTerminal> {
  const response = await axiosInstance.patch(`/canteen/pos-terminals/${id}`, data);
  return response.data.data;
}

export async function deletePosTerminal(id: string): Promise<void> {
  await axiosInstance.delete(`/canteen/pos-terminals/${id}`);
}

// Shift Endpoints
export async function getShifts(params?: { page?: number; limit?: number }): Promise<Shift[]> {
  const response = await axiosInstance.get('/canteen/shifts', { params });
  return response.data.data;
}

export async function getShift(id: string): Promise<Shift> {
  const response = await axiosInstance.get(`/canteen/shifts/${id}`);
  return response.data.data;
}

export async function openShift(data: OpenShiftFormData): Promise<Shift> {
  const response = await axiosInstance.post('/canteen/shifts/open', data);
  return response.data.data;
}

export async function closeShift(id: string, data: CloseShiftFormData): Promise<Shift> {
  const response = await axiosInstance.post(`/canteen/shifts/${id}/close`, data);
  return response.data.data;
}

// Order Endpoints
export async function getOrders(params?: { page?: number; limit?: number }): Promise<Order[]> {
  const response = await axiosInstance.get('/canteen/orders', { params });
  return response.data.data;
}

export async function getOrder(id: string): Promise<Order> {
  const response = await axiosInstance.get(`/canteen/orders/${id}`);
  return response.data.data;
}

export async function createOrder(data: OrderFormData): Promise<Order> {
  const response = await axiosInstance.post('/canteen/orders', data);
  return response.data.data;
}

export async function updateOrder(id: string, data: Partial<OrderFormData>): Promise<Order> {
  const response = await axiosInstance.patch(`/canteen/orders/${id}`, data);
  return response.data.data;
}

export async function deleteOrder(id: string): Promise<void> {
  await axiosInstance.delete(`/canteen/orders/${id}`);
}

// Order Item Endpoints
export async function updateOrderItem(orderId: string, itemId: string, data: { quantity: number }): Promise<void> {
  await axiosInstance.patch(`/canteen/orders/${orderId}/items/${itemId}`, data);
}

export async function deleteOrderItem(orderId: string, itemId: string): Promise<void> {
  await axiosInstance.delete(`/canteen/orders/${orderId}/items/${itemId}`);
}
