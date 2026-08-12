// Customer Management Types

export type CustomerStatus = 'active' | 'inactive' | 'blacklisted';

export interface Customer {
  customerId: string;
  customerCode: string;
  customerName: string;
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
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerContact {
  contactId: string;
  customerId: string;
  name: string;
  designation?: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
}

export interface CustomerWithDetails extends Customer {
  contacts: CustomerContact[];
}

export interface CustomerFormData {
  customerName: string;
  gstin?: string;
  taxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentTermId?: string;
  creditLimit?: number;
  status?: CustomerStatus;
  contacts?: Omit<CustomerContact, 'contactId' | 'customerId'>[];
}

export interface CustomerSelectOption {
  value: string;
  label: string;
  code?: string;
  city?: string;
  status?: CustomerStatus;
}
