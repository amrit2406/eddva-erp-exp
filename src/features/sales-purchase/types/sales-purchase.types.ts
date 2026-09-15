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
  poItemId: string;
  itemId: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  id?: string;
  item?: { id: string; itemCode: string; itemName: string };
  poItem?: { id: string; quantity: number; unitPrice: number };
}

export interface GRN {
  id: string;
  grnNumber?: string;
  poId: string;
  vendorId: string;
  receivedDate: string;
  warehouseId: string;
  items: GRNItem[];
  status: string;
  po?: { id: string; poNumber: string; poDate?: string };
  vendor?: Vendor;
  warehouse?: Warehouse;
  createdAt?: string;
  updatedAt?: string;
}

export interface GRNFormData {
  poId: string;
  vendorId: string;
  receivedDate: string;
  warehouseId: string;
  items: GRNItem[];
}

// Invoices (Purchase Invoices — see SalesInvoice for the separate sales flow)
export interface InvoiceItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxCodeId: string;
  id?: string;
  item?: { id: string; itemCode: string; itemName: string };
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  vendorInvoiceNumber?: string;
  vendorId: string;
  poId?: string;
  grnId?: string;
  invoiceDate: string;
  dueDate: string;
  discount: number;
  items: InvoiceItem[];
  status: string;
  paymentStatus?: string;
  subtotal?: number;
  taxAmount?: number;
  grandTotal?: number;
  vendor?: Vendor;
  po?: { id: string; poNumber: string; poDate?: string };
  grn?: { id: string; grnNumber: string; receivedDate?: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchMismatch {
  type: 'QUANTITY' | 'PRICE' | 'ITEM_NOT_FOUND' | 'TAX';
  itemId: string;
  message: string;
  poQuantity?: number;
  receivedQuantity?: number;
  invoiceQuantity?: number;
  poUnitPrice?: number;
  invoiceUnitPrice?: number;
  difference?: number;
}

export interface MatchResult {
  matched: boolean;
  mismatches: MatchMismatch[];
}

export interface InvoiceFormData {
  vendorInvoiceNumber: string;
  vendorId: string;
  poId?: string;
  grnId?: string;
  invoiceDate: string;
  discount: number;
  items: InvoiceItem[];
}

// Payments (Purchase Payments — see SalesReceipt for the separate sales flow)
export interface Payment {
  id: string;
  paymentNumber?: string;
  purchaseInvoiceId: string;
  paymentDate: string;
  amount: number;
  mode: string;
  referenceNo?: string;
  purchaseInvoice?: Invoice;
  creator?: { id: string; name: string };
  createdAt?: string;
}

export interface PaymentFormData {
  purchaseInvoiceId: string;
  paymentDate: string;
  amount: number;
  mode: string;
  referenceNo?: string;
}

// Sales Orders
export interface SalesOrderItem {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxCodeId: string;
}

export interface SalesOrder {
  id: string;
  customerId: string;
  soDate: string;
  deliveryDate: string;
  discount: number;
  items: SalesOrderItem[];
  status: string;
  customer?: Customer;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesOrderFormData {
  customerId: string;
  soDate: string;
  deliveryDate: string;
  discount: number;
  items: SalesOrderItem[];
}

// Sales Invoices
export interface SalesInvoiceItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxCodeId: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber?: string;
  customerId: string;
  soId?: string;
  invoiceDate: string;
  dueDate?: string;
  discount: number;
  items: SalesInvoiceItem[];
  status: string;
  paymentStatus?: string;
  grandTotal?: number;
  customer?: Customer;
  salesOrder?: SalesOrder;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesInvoiceFormData {
  customerId: string;
  soId?: string;
  invoiceDate: string;
  discount: number;
  items: SalesInvoiceItem[];
}

// Sales Receipts
export interface SalesReceipt {
  id: string;
  salesInvoiceId: string;
  receiptDate: string;
  amount: number;
  mode: string;
  referenceNo?: string;
  status: string;
  salesInvoice?: SalesInvoice;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesReceiptFormData {
  salesInvoiceId: string;
  receiptDate: string;
  amount: number;
  mode: string;
  referenceNo?: string;
}

// Reports
export interface PurchaseRegisterItem {
  id: string;
  invoiceNumber: string;
  vendorInvoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  vendor: {
    id: string;
    vendorCode: string;
    vendorName: string;
    gstin: string;
  };
  items: Array<{
    id: string;
    itemId: string;
    quantity: number;
    unitPrice: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    lineTotal: number;
    item: {
      id: string;
      itemCode: string;
      itemName: string;
      hsnSacCode: string;
    };
    taxCode: {
      id: string;
      name: string;
      cgstPct: number;
      sgstPct: number;
      igstPct: number;
    };
  }>;
}

export interface SalesRegisterItem {
  id: string;
  invoiceNumber: string;
  customerInvoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  status: string;
  paymentStatus: string;
  customer: {
    id: string;
    customerCode: string;
    customerName: string;
    gstin: string;
  };
  items: Array<{
    id: string;
    itemId: string;
    quantity: number;
    unitPrice: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    lineTotal: number;
    item: {
      id: string;
      itemCode: string;
      itemName: string;
      hsnSacCode: string;
    };
    taxCode: {
      id: string;
      name: string;
      cgstPct: number;
      sgstPct: number;
      igstPct: number;
    };
  }>;
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
