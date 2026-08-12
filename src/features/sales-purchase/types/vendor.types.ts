// Vendor Management Types

export type VendorStatus = 'active' | 'inactive' | 'blacklisted';

export interface Vendor {
  vendorId: string;
  vendorCode: string;
  vendorName: string;
  gstin?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentTermId?: string;
  paymentTermName?: string;
  creditLimit?: number;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VendorContact {
  contactId: string;
  vendorId: string;
  name: string;
  designation?: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
}

export interface VendorBankDetail {
  bankId: string;
  vendorId: string;
  accountNo: string;
  ifscCode?: string;
  swiftCode?: string;
  bankName: string;
  isPrimary: boolean;
}

export interface VendorWithDetails extends Vendor {
  contacts: VendorContact[];
  bankDetails: VendorBankDetail[];
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
  status?: VendorStatus;
  contacts?: Omit<VendorContact, 'contactId' | 'vendorId'>[];
  bankDetails?: Omit<VendorBankDetail, 'bankId' | 'vendorId'>[];
}

export interface VendorSelectOption {
  value: string;
  label: string;
  code?: string;
  city?: string;
  status?: VendorStatus;
}
