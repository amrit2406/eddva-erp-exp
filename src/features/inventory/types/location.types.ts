export type InventoryLocationType = 'store' | 'department' | 'classroom' | 'lab';
export type InventoryLocationStatus = 'ACTIVE' | 'INACTIVE';

export interface InventoryLocation {
  location_id: number;
  name: string;
  type: InventoryLocationType;
  status: InventoryLocationStatus;
  created_at: string;
  updated_at: string;
}

export interface InventoryLocationFormData {
  name: string;
  type: InventoryLocationType;
}

export interface InventoryLocationUpdateData {
  name?: string;
  type?: InventoryLocationType;
  status?: InventoryLocationStatus;
}

export interface InventoryLocationQueryParams {
  search?: string;
  type?: InventoryLocationType;
}
