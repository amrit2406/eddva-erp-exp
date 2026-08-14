// Item Categories
export interface ItemCategory {
  id: string;
  categoryName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemCategoryFormData {
  categoryName: string;
}

// UOM (Unit of Measure)
export interface UOM {
  id: string;
  name: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UOMFormData {
  name: string;
  code: string;
}

// Tax Codes
export interface TaxCode {
  id: string;
  name: string;
  cgstPct: number;
  sgstPct: number;
  igstPct: number;
  effectiveFrom: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxCodeFormData {
  name: string;
  cgstPct: number;
  sgstPct: number;
  igstPct: number;
  effectiveFrom: string;
}

// Payment Terms
export interface PaymentTerm {
  id: string;
  termName: string;
  days: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentTermFormData {
  termName: string;
  days: number;
}

// Warehouses
export interface Warehouse {
  id: string;
  name: string;
  address: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseFormData {
  name: string;
  address: string;
  isDefault: boolean;
}

// Items
export interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  categoryId: string;
  uomId: string;
  quantity: number;
  hsnSacCode: string;
  purchasePrice: number;
  salesPrice: number;
  taxCodeId: string;
  category?: ItemCategory;
  uom?: UOM;
  taxCode?: TaxCode;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemFormData {
  itemCode: string;
  itemName: string;
  categoryId: string;
  uomId: string;
  quantity: number;
  hsnSacCode: string;
  purchasePrice: number;
  salesPrice: number;
  taxCodeId: string;
}

// Vendors
export interface VendorContact {
  name: string;
  designation: string;
  phone: string;
  email: string;
}

export interface VendorBankDetail {
  accountNo: string;
  ifsc: string;
  swift: string;
  bankName: string;
  isPrimary: boolean;
}

export interface Vendor {
  id: string;
  vendorName: string;
  gstin?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentTermId?: string;
  creditLimit?: number;
  status: string;
  contacts?: VendorContact[];
  bankDetails?: VendorBankDetail[];
  paymentTerm?: PaymentTerm;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorFormData {
  vendorName: string;
  gstin?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentTermId?: string;
  creditLimit?: number;
  status: string;
  contacts?: VendorContact[];
  bankDetails?: VendorBankDetail[];
}

// Customers
export interface CustomerContact {
  name: string;
  designation: string;
  phone: string;
  email: string;
}

export interface Customer {
  id: string;
  customerName: string;
  gstin?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentTermId?: string;
  creditLimit?: number;
  status: string;
  contacts?: CustomerContact[];
  paymentTerm?: PaymentTerm;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFormData {
  customerName: string;
  gstin?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentTermId?: string;
  creditLimit?: number;
  status: string;
  contacts?: CustomerContact[];
}

// Purchase Orders
export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxCodeId: string;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  poDate: string;
  expectedDeliveryDate: string;
  warehouseId: string;
  discount: number;
  items: PurchaseOrderItem[];
  status: string;
  vendor?: Vendor;
  warehouse?: Warehouse;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseOrderFormData {
  vendorId: string;
  poDate: string;
  expectedDeliveryDate: string;
  warehouseId: string;
  discount: number;
  items: PurchaseOrderItem[];
}

// GRN (Goods Received Note)
export interface GRNItem {
  poItemId: string;
  itemId: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
}

export interface GRN {
  id: string;
  poId: string;
  vendorId: string;
  receivedDate: string;
  warehouseId: string;
  items: GRNItem[];
  status: string;
  purchaseOrder?: PurchaseOrder;
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

// Invoices
export interface InvoiceItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  taxCodeId: string;
}

export interface Invoice {
  id: string;
  invoiceType: 'SALES' | 'PURCHASE';
  vendorInvoiceNumber?: string;
  customerId?: string;
  vendorId?: string;
  poId?: string;
  grnId?: string;
  invoiceDate: string;
  dueDate: string;
  warehouseId: string;
  discount: number;
  items: InvoiceItem[];
  status: string;
  customer?: Customer;
  vendor?: Vendor;
  purchaseOrder?: PurchaseOrder;
  grn?: GRN;
  warehouse?: Warehouse;
  createdAt?: string;
  updatedAt?: string;
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

// Payments
export interface Payment {
  id: string;
  paymentType: 'RECEIVED' | 'PAID';
  purchaseInvoiceId?: string;
  invoiceId?: string;
  paymentDate: string;
  amount: number;
  mode: string;
  referenceNo?: string;
  status: string;
  invoice?: Invoice;
  createdAt?: string;
  updatedAt?: string;
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
  customerId: string;
  soId?: string;
  invoiceDate: string;
  discount: number;
  items: SalesInvoiceItem[];
  status: string;
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
