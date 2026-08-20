// RBAC Types
export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  module: string;
  resource: string | null;
  action: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PermissionFormData {
  key: string;
  name: string;
  description: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt?: string;
  rolePermissions: RolePermission[];
  userRoles?: any[];
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
  permission: Permission;
}

export interface RoleFormData {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface CanteenUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roles: string[];
  permissions: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt?: string;
}

export interface CanteenUserWithRoles {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: Role[];
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CanteenUserFormData {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export interface UsersResponse {
  users: CanteenUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Reports Types
export interface SalesReport {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: {
    name: string;
    quantitySold: number;
    revenue: number;
  }[];
  salesByDate: {
    date: string;
    sales: number;
    orders: number;
  }[];
}

// Menu Types
export type FoodType = 'VEG' | 'NON_VEG' | 'EGG';

export interface MenuCategory {
  id: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MenuCategoryFormData {
  name: string;
  displayOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  taxRate: number;
  foodType: FoodType;
  imageUrl: string;
  isAvailable: boolean;
  availableDays: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MenuItemFormData {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  taxRate: number;
  foodType: FoodType;
  imageUrl: string;
  isAvailable: boolean;
  availableDays: string;
}

export interface MenuItemAvailability {
  isAvailable: boolean;
}

export interface MenuSchedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  itemId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MenuScheduleFormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

// Member Types
export type MemberType = 'STUDENT' | 'TEACHER' | 'STAFF' | 'GUEST';

export interface CanteenMember {
  id: string;
  name: string;
  memberType: MemberType;
  idCardBarcode: string;
  externalRefId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CanteenMemberFormData {
  name: string;
  memberType: MemberType;
  idCardBarcode: string;
  externalRefId: string;
}

// POS Types
export interface PosTerminal {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PosTerminalFormData {
  name: string;
  location: string;
}

export interface Shift {
  id: string;
  terminalId: string;
  terminalName?: string;
  openingCash: number;
  closingCash?: number;
  openedAt: string;
  closedAt?: string;
  status: 'OPEN' | 'CLOSED';
  openedBy?: string;
  closedBy?: string;
}

export interface OpenShiftFormData {
  terminalId: string;
  openingCash: number;
}

export interface CloseShiftFormData {
  closingCash: number;
}
