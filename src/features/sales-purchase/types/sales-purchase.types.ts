// Item Categories
export interface ItemCategory {
  category_id: number;
  institute_id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface ItemCategoryFormData {
  name: string;
}

// UOM (Unit of Measure)
export interface UOM {
  uom_id: number;
  institute_id: string;
  name: string;
  symbol: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface UOMFormData {
  name: string;
  symbol: string;
}

// Tax Codes
export interface TaxCode {
  tax_code_id: number;
  institute_id: string;
  name: string;
  cgst_pct: string;
  sgst_pct: string;
  igst_pct: string;
  effective_from: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

export interface TaxCodeFormData {
  name: string;
  cgst_pct: number;
  sgst_pct: number;
  igst_pct: number;
  effective_from: string;
}

// Payment Terms
export interface PaymentTerm {
  payment_term_id: number;
  institute_id: string;
  term_name: string;
  days: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentTermFormData {
  term_name: string;
  days: number;
}

// Warehouses
export interface Warehouse {
  warehouse_id: number;
  institute_id: string;
  name: string;
  address: string | null;
  is_default: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface WarehouseFormData {
  name: string;
  address: string;
  is_default: boolean;
}

// Items
export interface Item {
  item_id: number;
  institute_id: string;
  item_code: string;
  item_name: string;
  category_id: number;
  uom_id: number;
  hsn_sac_code: string | null;
  purchase_price: string;
  sales_price: string;
  tax_code_id: number;
  status: string;
  category?: { name: string };
  uom?: { name: string; symbol: string };
  tax_code?: TaxCode;
  created_at: string;
  updated_at: string;
}

export interface ItemFormData {
  item_name: string;
  category_id: number;
  uom_id: number;
  hsn_sac_code?: string;
  purchase_price: number;
  sales_price: number;
  tax_code_id: number;
}

// Vendors
export interface VendorContact {
  contact_id: number;
  vendor_id: number;
  name: string;
  designation: string;
  phone: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface VendorContactFormData {
  name: string;
  designation: string;
  phone: string;
  email: string;
}

export interface VendorBankDetail {
  bank_id: number;
  vendor_id: number;
  account_no: string;
  ifsc: string;
  swift: string;
  bank_name: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VendorBankDetailFormData {
  account_no: string;
  ifsc: string;
  swift: string;
  bank_name: string;
  is_primary: boolean;
}

export interface Vendor {
  vendor_id: number;
  institute_id: string;
  vendor_code: string;
  vendor_name: string;
  gstin: string | null;
  tax_id: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  payment_term_id: number | null;
  credit_limit: string | null;
  status: string;
  contacts?: VendorContact[];
  bank_details?: VendorBankDetail[];
  payment_term?: PaymentTerm;
  created_at: string;
  updated_at: string;
}

export interface VendorFormData {
  vendor_name: string;
  gstin?: string;
  tax_id?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  payment_term_id?: number;
  credit_limit?: number;
  status?: string;
}

// Customers
export interface CustomerContact {
  contact_id: number;
  customer_id: number;
  name: string;
  designation: string;
  phone: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerContactFormData {
  name: string;
  designation: string;
  phone: string;
  email: string;
}

export interface Customer {
  customer_id: number;
  institute_id: string;
  customer_code: string;
  customer_name: string;
  gstin: string | null;
  tax_id: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  payment_term_id: number | null;
  credit_limit: string | null;
  status: string;
  contacts?: CustomerContact[];
  payment_term?: PaymentTerm;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  customer_name: string;
  gstin?: string;
  tax_id?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  payment_term_id?: number;
  credit_limit?: number;
  status?: string;
}

// Purchase Orders
export interface PurchaseOrderItem {
  po_item_id: number;
  purchase_order_id: number;
  item_id: number;
  quantity: string;
  unit_price: string;
  tax_code_id: number;
  line_discount: string;
  line_tax_amount: string;
  line_total: string;
  received_qty: string;
  created_at?: string;
  updated_at?: string;
  item?: { item_id: number; item_code: string; item_name: string };
  tax_code?: TaxCode;
}

export interface PurchaseOrderItemFormData {
  item_id: number;
  quantity: number;
  unit_price: number;
  tax_code_id: number;
  line_discount?: number;
}

export interface PurchaseOrder {
  po_id: number;
  institute_id: string;
  po_number: string;
  financial_year: string;
  vendor_id: number;
  po_date: string;
  expected_delivery_date: string | null;
  warehouse_id: number;
  status: string;
  subtotal: string;
  tax_amount: string;
  discount: string;
  grand_total: string;
  created_by: string | null;
  submitted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
  warehouse?: Warehouse;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderFormData {
  vendor_id: number;
  po_date: string;
  expected_delivery_date: string;
  warehouse_id: number;
  discount: number;
  items: PurchaseOrderItemFormData[];
}

// PO Approval Rules
export interface ApprovalRule {
  rule_id: number;
  institute_id: string;
  name: string;
  min_amount: string | null;
  max_amount: string | null;
  approver_role_id: number | null;
  sequence: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  approver_role?: { role_id: number; name: string } | null;
}

export interface ApprovalRuleFormData {
  name: string;
  min_amount?: number;
  max_amount?: number;
  approver_role_id?: number;
  sequence: number;
  is_active?: boolean;
}

// GRN (Goods Received Note)
export interface GRNItem {
  grn_item_id: number;
  grn_id: number;
  po_item_id: number;
  item_id: number;
  received_qty: string;
  accepted_qty: string;
  rejected_qty: string;
  created_at?: string;
  item?: { item_id: number; item_code: string; item_name: string };
}

export interface GRNItemFormData {
  po_item_id: number;
  received_qty: number;
  accepted_qty: number;
  rejected_qty: number;
}

export interface GRN {
  grn_id: number;
  institute_id: string;
  grn_number: string;
  financial_year: string;
  purchase_order_id: number;
  vendor_id: number;
  received_date: string;
  warehouse_id: number;
  status: string;
  created_by: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
  warehouse?: Warehouse;
  purchase_order?: { po_id: number; po_number: string };
  items?: GRNItem[];
}

export interface GRNFormData {
  purchase_order_id: number;
  received_date: string;
  warehouse_id: number;
  items: GRNItemFormData[];
}

// Invoices (Purchase Invoices — see SalesInvoice for the separate sales flow)
export interface InvoiceItem {
  pi_item_id: number;
  pi_id: number;
  po_item_id: number | null;
  grn_item_id: number | null;
  item_id: number;
  quantity: string;
  unit_price: string;
  cgst_rate: string;
  sgst_rate: string;
  igst_rate: string;
  cgst_amount: string;
  sgst_amount: string;
  igst_amount: string;
  line_discount: string;
  line_total: string;
  item?: { item_id: number; item_code: string; item_name: string };
}

export interface InvoiceItemFormData {
  item_id: number;
  po_item_id?: number;
  grn_item_id?: number;
  quantity: number;
  unit_price: number;
  tax_code_id: number;
  line_discount?: number;
}

export interface InvoicePayment {
  payment_id: number;
  pi_id: number;
  payment_date: string;
  amount: string;
  mode: string;
  reference_no: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface Invoice {
  pi_id: number;
  institute_id: string;
  invoice_number: string;
  financial_year: string;
  vendor_invoice_number: string;
  vendor_id: number;
  purchase_order_id: number | null;
  grn_id: number | null;
  invoice_date: string;
  due_date: string | null;
  subtotal: string;
  tax_amount: string;
  discount: string;
  grand_total: string;
  paid_amount: string;
  payment_status: string;
  status: string;
  created_by: string | null;
  posted_by: string | null;
  posted_at: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
  purchase_order?: { po_id: number; po_number: string };
  grn?: { grn_id: number; grn_number: string };
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
}

export interface InvoiceFormData {
  vendor_invoice_number: string;
  vendor_id: number;
  purchase_order_id?: number;
  grn_id?: number;
  invoice_date: string;
  due_date?: string;
  discount: number;
  items: InvoiceItemFormData[];
}

// Payments (Purchase Payments — see SalesReceipt for the separate sales flow)
export interface Payment {
  payment_id: number;
  institute_id: string;
  pi_id: number;
  payment_date: string;
  amount: string;
  mode: string;
  reference_no: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  invoice?: Invoice;
}

export interface PaymentFormData {
  pi_id: number;
  payment_date: string;
  amount: number;
  mode: string;
  reference_no?: string;
}

// Sales Orders
export interface SalesOrderItem {
  so_item_id: number;
  sales_order_id: number;
  item_id: number;
  quantity: string;
  unit_price: string;
  tax_code_id: number;
  line_discount: string;
  line_tax_amount: string;
  line_total: string;
  invoiced_qty: string;
  created_at?: string;
  updated_at?: string;
  item?: { item_id: number; item_code: string; item_name: string };
  tax_code?: TaxCode;
}

export interface SalesOrderItemFormData {
  item_id: number;
  quantity: number;
  unit_price: number;
  tax_code_id: number;
  line_discount?: number;
}

export interface SalesOrder {
  so_id: number;
  institute_id: string;
  so_number: string;
  financial_year: string;
  customer_id: number;
  so_date: string;
  delivery_date: string | null;
  status: string;
  subtotal: string;
  tax_amount: string;
  discount: string;
  grand_total: string;
  created_by: string | null;
  confirmed_at: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: SalesOrderItem[];
}

export interface SalesOrderFormData {
  customer_id: number;
  so_date: string;
  delivery_date?: string;
  discount: number;
  items: SalesOrderItemFormData[];
}

// Sales Invoices
export interface SalesInvoiceItem {
  si_item_id: number;
  si_id: number;
  so_item_id: number | null;
  item_id: number;
  quantity: string;
  unit_price: string;
  cgst_rate: string;
  sgst_rate: string;
  igst_rate: string;
  cgst_amount: string;
  sgst_amount: string;
  igst_amount: string;
  line_discount: string;
  line_total: string;
  item?: { item_id: number; item_code: string; item_name: string };
}

export interface SalesInvoiceItemFormData {
  item_id: number;
  so_item_id?: number;
  quantity: number;
  unit_price: number;
  tax_code_id: number;
  line_discount?: number;
}

export interface SalesInvoiceReceipt {
  receipt_id: number;
  si_id: number;
  receipt_date: string;
  amount: string;
  mode: string;
  reference_no: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface SalesInvoice {
  si_id: number;
  institute_id: string;
  invoice_number: string;
  financial_year: string;
  customer_id: number;
  sales_order_id: number | null;
  invoice_date: string;
  due_date: string | null;
  subtotal: string;
  tax_amount: string;
  discount: string;
  grand_total: string;
  paid_amount: string;
  payment_status: string;
  status: string;
  created_by: string | null;
  posted_by: string | null;
  posted_at: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  sales_order?: { so_id: number; so_number: string };
  items?: SalesInvoiceItem[];
  receipts?: SalesInvoiceReceipt[];
}

export interface SalesInvoiceFormData {
  customer_id: number;
  sales_order_id?: number;
  invoice_date: string;
  due_date?: string;
  discount: number;
  items: SalesInvoiceItemFormData[];
}

// Sales Receipts
export interface SalesReceipt {
  receipt_id: number;
  institute_id: string;
  si_id: number;
  receipt_date: string;
  amount: string;
  mode: string;
  reference_no: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  invoice?: SalesInvoice;
}

export interface SalesReceiptFormData {
  si_id: number;
  receipt_date: string;
  amount: number;
  mode: string;
  reference_no?: string;
}

// Reports
export interface PurchaseRegisterItem {
  invoiceNumber: string;
  vendorInvoiceNumber: string;
  invoiceDate: string;
  vendor: {
    vendor_id: number;
    vendor_name: string;
    vendor_code: string;
  };
  item: {
    item_id: number;
    item_code: string;
    item_name: string;
  };
  quantity: string;
  taxableValue: number;
  cgst: string;
  sgst: string;
  igst: string;
  discount: string;
  lineTotal: string;
  paymentStatus: string;
}

export interface SalesRegisterItem {
  invoiceNumber: string;
  invoiceDate: string;
  customer: {
    customer_id: number;
    customer_name: string;
    customer_code: string;
  };
  item: {
    item_id: number;
    item_code: string;
    item_name: string;
  };
  quantity: string;
  taxableValue: number;
  cgst: string;
  sgst: string;
  igst: string;
  discount: string;
  lineTotal: string;
  paymentStatus: string;
}

export interface RegisterSummary {
  invoiceCount: number;
  totalCgst: string;
  totalSgst: string;
  totalIgst: string;
  totalDiscount: string;
  totalSubtotal: string;
  totalTax: string;
  totalGrandTotal: string;
}

export interface RegisterPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RegisterResponse<T> {
  data: T[];
  pagination: RegisterPagination;
  summary: RegisterSummary;
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

// Dashboard
export interface DashboardStatusCount {
  status: string;
  count: number;
}

export interface DashboardPurchaseOrders {
  by_status: DashboardStatusCount[];
  open_count: number;
  pending_approval_count: number;
  pending_approval_value: number;
}

export interface DashboardGRNs {
  draft_count: number;
  posted_count: number;
}

export interface DashboardInvoiceSummary {
  period_count: number;
  period_subtotal: number;
  period_tax: number;
  period_discount: number;
  period_grand_total: number;
  outstanding_count: number;
  outstanding_amount: number;
  overdue_count: number;
  overdue_amount: number;
}

export interface DashboardTopVendor {
  vendor_id: number;
  vendor_name: string;
  vendor_code: string;
  invoice_count: number;
  total_amount: number;
}

export interface DashboardTopCustomer {
  customer_id: number;
  customer_name: string;
  customer_code: string;
  invoice_count: number;
  total_amount: number;
}

export interface DashboardPurchaseSection {
  purchase_orders: DashboardPurchaseOrders;
  grns: DashboardGRNs;
  invoices: DashboardInvoiceSummary;
  top_vendors: DashboardTopVendor[];
}

export interface DashboardSalesOrders {
  by_status: DashboardStatusCount[];
  open_count: number;
}

export interface DashboardSalesSection {
  sales_orders: DashboardSalesOrders;
  invoices: DashboardInvoiceSummary;
  top_customers: DashboardTopCustomer[];
}

export interface DashboardSummary {
  range: {
    from: string | null;
    to: string | null;
  };
  vendor_count: number;
  customer_count: number;
  active_item_count: number;
  purchase: DashboardPurchaseSection;
  sales: DashboardSalesSection;
}
