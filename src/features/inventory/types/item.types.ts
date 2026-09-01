export type InventoryItemType = 'consumable' | 'asset';
export type InventoryItemStatus = 'ACTIVE' | 'INACTIVE';

export interface InventoryItem {
  item_id: number;
  item_code: string;
  name: string;
  category_id: number;
  category?: { category_id: number; name: string };
  item_type: InventoryItemType;
  unit_of_measure: string;
  reorder_level: number;
  description?: string | null;
  image_url?: string | null;
  status: InventoryItemStatus;
  created_at: string;
  updated_at: string;
  item_vendors?: InventoryItemVendor[];
  balances?: InventoryItemStockBalance[];
}

export interface InventoryItemStockBalance {
  location_id: number;
  location?: { location_id: number; name: string };
  quantity: number;
}

export interface InventoryItemFormData {
  item_code: string;
  name: string;
  category_id: number;
  item_type: InventoryItemType;
  unit_of_measure: string;
  reorder_level?: number;
  description?: string;
  image_url?: string;
}

export interface InventoryItemUpdateData {
  item_code?: string;
  name?: string;
  category_id?: number;
  unit_of_measure?: string;
  reorder_level?: number;
  description?: string;
  image_url?: string;
  status?: InventoryItemStatus;
}

export interface InventoryItemPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InventoryItemListResult {
  data: InventoryItem[];
  pagination: InventoryItemPagination;
}

export interface InventoryItemQueryParams {
  search?: string;
  category_id?: number;
  item_type?: InventoryItemType;
  low_stock?: boolean;
  page?: number;
  limit?: number;
}

export interface InventoryItemVendor {
  id: number;
  item_id: number;
  vendor_id: number;
  vendor?: { vendor_id: number; name: string };
  last_purchase_price?: number | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryItemVendorFormData {
  vendor_id: number;
  last_purchase_price?: number;
}
