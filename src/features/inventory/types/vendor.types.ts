export type InventoryVendorStatus = 'ACTIVE' | 'INACTIVE';

export interface InventoryVendor {
  vendor_id: number;
  name: string;
  contact_phone?: string | null;
  email?: string | null;
  address?: string | null;
  status: InventoryVendorStatus;
  created_at: string;
  updated_at: string;
}

export interface InventoryVendorFormData {
  name: string;
  contact_phone?: string;
  email?: string;
  address?: string;
}

export interface InventoryVendorUpdateData {
  name?: string;
  contact_phone?: string;
  email?: string;
  address?: string;
  status?: InventoryVendorStatus;
}
