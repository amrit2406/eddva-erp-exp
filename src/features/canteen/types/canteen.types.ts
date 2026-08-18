// RBAC Types
export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PermissionFormData {
  key: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
  createdAt: string;
  updatedAt?: string;
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
  canteenRoleId: string;
  roleId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CanteenUserFormData {
  name: string;
  email: string;
  password: string;
  canteenRoleId: string;
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
