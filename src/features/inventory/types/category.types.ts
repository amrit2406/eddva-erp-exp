export type InventoryCategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface InventoryCategoryRef {
  category_id: number;
  name: string;
}

export interface InventoryCategory {
  category_id: number;
  name: string;
  parent_category_id?: number | null;
  parent?: InventoryCategoryRef | InventoryCategory | null;
  children?: InventoryCategory[];
  status: InventoryCategoryStatus;
  created_at: string;
  updated_at: string;
  _count?: { items: number; children: number };
}

export interface InventoryCategoryFormData {
  name: string;
  parent_category_id?: number;
}

export interface InventoryCategoryUpdateData {
  name?: string;
  parent_category_id?: number;
  status?: InventoryCategoryStatus;
}
