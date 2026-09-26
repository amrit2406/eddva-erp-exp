// Canteen Platform Auth (independent auth island, decoupled from the core User table)
export interface CanteenPlatformUser {
  id: string;
  institute_id: string;
  user_name: string;
  user_email?: string;
  user_role: string;
  is_institute_admin: boolean;
}

export interface CanteenLoginCredentials {
  username: string;
  password: string;
}

// RBAC Types
export interface Permission {
  permission_id: number;
  key: string;
  resource: string;
  action: string;
  name: string;
  category: string;
  description: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionFormData {
  resource: string;
  action: string;
  name: string;
  category: string;
  description: string;
  is_active?: boolean;
}

export interface PermissionResource {
  resource: string;
  name: string;
  available_actions: string[];
  permissions: Permission[];
}

export interface PermissionsCatalog {
  total: number;
  resources: PermissionResource[];
  all_permissions: Permission[];
}

export interface RolePermission {
  resource: string;
  actions: string[];
}

export interface Role {
  role_id: number;
  institute_id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  created_at: string;
  updated_at: string;
  _count?: {
    user_roles: number;
  };
  user_roles?: unknown[];
}

export interface RoleFormData {
  name: string;
  description: string;
  permissions: RolePermission[];
}

export interface UserAssignment {
  id: number;
  eddva_user_id: string;
  user_name: string;
  user_email: string;
  username: string;
  role_id: number;
  is_active?: boolean;
  role?: Pick<Role, 'role_id' | 'name'>;
  assigned_at?: string;
}

export interface UserAssignmentFormData {
  eddva_user_id: string;
  user_name: string;
  user_email: string;
  username: string;
  password: string;
  role_id: number;
}

export interface ResetPasswordFormData {
  new_password: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// The API sends money and rates as strings ("150.00"); read them with toNumber().
export type Num = number | string;

// Reports Types (shapes as the API returns them)
// ISO timestamps; the API filters on dateFrom <= time <= dateTo.
export interface ReportParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface SalesReport {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  grossSales: number;
  discount: number;
  tax: number;
  netSales: number;
  cashSales: number;
  cardSales: number;
  upiSales: number;
  walletSales: number;
}

export interface ItemSalesReportRow {
  itemId: string;
  itemName: string;
  categoryName: string;
  quantitySold: number;
  totalSales: number;
}

export type ItemSalesReport = ItemSalesReportRow[];

export interface CategorySalesReportRow {
  categoryName: string;
  totalItemsSold: number;
  totalSales: number;
}

export type CategorySalesReport = CategorySalesReportRow[];

export interface PaymentSummaryReportRow {
  paymentMode: string;
  status: string;
  transactionCount: number;
  totalAmount: number;
}

export type PaymentSummaryReport = PaymentSummaryReportRow[];

export interface ShiftsReport {
  summary: {
    totalShifts: number;
    closedShiftsCount: number;
    openShiftsCount: number;
    totalOpeningCash: number;
    totalExpectedCash: number;
    totalClosingCash: number;
    totalVariance: number;
  };
  shifts: Shift[];
}

// Menu Types
export type FoodType = 'VEG' | 'NON_VEG' | 'EGG';

export interface MenuCategory {
  id: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
  _count?: { items: number };
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
  price: Num;
  taxRate: Num;
  foodType: FoodType;
  imageUrl: string;
  isAvailable: boolean;
  availableDays: string;
  createdAt: string;
  updatedAt?: string;
  category?: Pick<MenuCategory, 'id' | 'name'>;
  schedules?: MenuSchedule[];
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
  wallet?: Wallet | null;
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
  _count?: { shifts: number; orders: number };
}

export interface PosTerminalFormData {
  name: string;
  location: string;
}

export interface Shift {
  id: string;
  terminalId: string;
  staffId?: string;
  openingCash: Num;
  closingCash?: Num | null;
  expectedCash?: Num | null;
  variance?: Num | null;
  shiftStart: string;
  shiftEnd?: string | null;
  status: 'OPEN' | 'CLOSED';
  createdAt?: string;
  terminal?: Pick<PosTerminal, 'id' | 'name' | 'location'>;
}

export interface OpenShiftFormData {
  terminalId: string;
  openingCash: number;
}

export interface CloseShiftFormData {
  closingCash: number;
}

// Order Types
export type OrderStatus = 'PLACED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type OrderPaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | string;

export interface OrderItem {
  id?: string;
  itemId: string;
  quantity: number;
}

export interface OrderItemDetail {
  id: string;
  orderId: string;
  itemId: string;
  quantity: number;
  unitPrice: Num;
  subtotal: Num;
  item?: Pick<MenuItem, 'id' | 'name' | 'price' | 'taxRate' | 'foodType' | 'imageUrl'>;
}

export interface AddOrderItemFormData {
  itemId: string;
  quantity: number;
}

export interface UpdateOrderStatusFormData {
  status: OrderStatus;
}

export interface Order {
  id: string;
  orderNumber?: string;
  memberId: string;
  terminalId: string;
  orderDate?: string;
  subtotal?: Num;
  taxAmount?: Num;
  discountAmount: Num;
  totalAmount?: Num;
  status: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  createdAt: string;
  updatedAt?: string;
  items: OrderItemDetail[];
  member?: Pick<CanteenMember, 'id' | 'name' | 'memberType' | 'idCardBarcode'>;
  terminal?: Pick<PosTerminal, 'id' | 'name' | 'location'>;
  payments?: Payment[];
}

export interface OrderFormData {
  memberId: string;
  terminalId: string;
  discountAmount: number;
  items: OrderItem[];
  status?: OrderStatus;
}

// Wallet Types
export type WalletStatus = 'ACTIVE' | 'BLOCKED';

export interface Wallet {
  id: string;
  memberId: string;
  balance: Num;
  dailySpendLimit: Num;
  status: WalletStatus;
  blockedReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  member?: Pick<CanteenMember, 'id' | 'name' | 'memberType' | 'idCardBarcode'>;
}

export interface WalletFormData {
  initialBalance: number;
  dailySpendLimit: number;
}

export interface UpdateWalletFormData {
  dailySpendLimit?: number;
}

export interface BlockWalletFormData {
  reason: string;
}

export type TopupPaymentMode = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';

export interface WalletTopup {
  id: string;
  walletId: string;
  amount: Num;
  paymentMode: TopupPaymentMode;
  transactionRef?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface WalletTopupFormData {
  amount: number;
  paymentMode: TopupPaymentMode;
  transactionRef?: string;
}

export type WalletTransactionType = 'CREDIT' | 'DEBIT';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: Num;
  balanceBefore?: Num;
  balanceAfter: Num;
  description?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  transactedAt?: string;
  createdAt?: string;
}

// Payment Types
export type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'OTHER';

export interface Payment {
  id: string;
  orderId: string;
  paymentMode: PaymentMode;
  amount: Num;
  transactionRef?: string | null;
  status?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentFormData {
  paymentMode: PaymentMode;
  amount: number;
  transactionRef?: string;
}
