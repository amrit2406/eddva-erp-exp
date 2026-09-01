export type InventoryAssetStatus = 'in_store' | 'issued' | 'under_repair' | 'disposed' | 'lost';

interface AssetItemRef {
  item_id: number;
  name: string;
  item_code: string;
  image_url?: string | null;
}

interface AssetLocationRef {
  location_id: number;
  name: string;
}

interface AssetHolderRef {
  holder_id: number;
  name: string;
  holder_type: 'staff' | 'student' | 'department';
}

interface AssetPurchaseRef {
  purchase_id: number;
  purchase_date: string;
  unit_price: number;
  vendor_id: number;
}

export interface InventoryAssetMaintenance {
  maintenance_id: number;
  asset_unit_id: number;
  description: string;
  cost?: number | null;
  status: string;
  created_at: string;
}

export interface InventoryAssetActiveIssue {
  issue_id: number;
  holder?: AssetHolderRef;
  status: string;
  issue_date?: string;
}

export interface InventoryAsset {
  asset_unit_id: number;
  item_id: number;
  item?: AssetItemRef;
  asset_tag: string;
  serial_number?: string | null;
  status: InventoryAssetStatus;
  current_location_id?: number | null;
  current_location?: AssetLocationRef | null;
  current_holder_id?: number | null;
  current_holder?: AssetHolderRef | null;
  purchase_id?: number | null;
  purchase?: AssetPurchaseRef | null;
  purchase_date?: string | null;
  warranty_expiry?: string | null;
  created_at: string;
  updated_at: string;
  maintenance?: InventoryAssetMaintenance[];
  issues?: InventoryAssetActiveIssue[];
}

export interface InventoryAssetUpdateData {
  serial_number?: string;
  status?: InventoryAssetStatus;
  current_location_id?: number;
  warranty_expiry?: string;
}

export interface InventoryAssetQueryParams {
  item_id?: number;
  location_id?: number;
  holder_id?: number;
  status?: InventoryAssetStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface InventoryAssetPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InventoryAssetListResult {
  data: InventoryAsset[];
  pagination: InventoryAssetPagination;
}
