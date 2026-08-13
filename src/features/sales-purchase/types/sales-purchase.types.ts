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
