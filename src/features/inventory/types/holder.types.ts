export type InventoryHolderType = 'staff' | 'student' | 'department';
export type InventoryHolderStatus = 'ACTIVE' | 'INACTIVE';

export interface InventoryHolder {
  holder_id: number;
  holder_type: InventoryHolderType;
  name: string;
  external_ref_id?: string | null;
  contact_phone?: string | null;
  status: InventoryHolderStatus;
  created_at: string;
  updated_at: string;
}

export interface InventoryHolderFormData {
  holder_type: InventoryHolderType;
  name: string;
  external_ref_id?: string;
  contact_phone?: string;
}

export interface InventoryHolderUpdateData {
  name?: string;
  external_ref_id?: string;
  contact_phone?: string;
  status?: InventoryHolderStatus;
}

export interface InventoryHolderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InventoryHolderQueryParams {
  search?: string;
  holder_type?: InventoryHolderType;
  page?: number;
  limit?: number;
}

export interface InventoryHolderListResult {
  data: InventoryHolder[];
  pagination: InventoryHolderPagination;
}

export interface InventoryHolderCurrentIssue {
  issue_id: number;
  item_id: number;
  item?: { item_id: number; name: string; item_code: string; item_type: 'consumable' | 'asset' };
  asset_unit_id?: number | null;
  asset_unit?: { asset_unit_id: number; asset_tag: string } | null;
  quantity: number;
  quantity_returned: number;
  source_location_id: number;
  source_location?: { location_id: number; name: string };
  issue_date: string;
  expected_return_date?: string | null;
  status: string;
  approval_status: string;
}
