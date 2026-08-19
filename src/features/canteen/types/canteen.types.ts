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
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
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
