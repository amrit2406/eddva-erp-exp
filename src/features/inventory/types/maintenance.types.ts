export type InventoryMaintenanceStatus = 'reported' | 'in_progress' | 'resolved';

interface MaintenanceAssetUnitRef {
  asset_unit_id: number;
  asset_tag: string;
  item?: { name: string };
  status?: string;
}

export interface InventoryMaintenance {
  maintenance_id: number;
  asset_unit_id: number;
  asset_unit?: MaintenanceAssetUnitRef;
  issue_reported: string;
  service_date?: string | null;
  cost?: number | null;
  status: InventoryMaintenanceStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryMaintenanceFormData {
  asset_unit_id: number;
  issue_reported: string;
  service_date?: string;
  cost?: number;
}

export interface InventoryMaintenanceUpdateData {
  status?: InventoryMaintenanceStatus;
  service_date?: string;
  cost?: number;
}

export interface InventoryMaintenancePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InventoryMaintenanceQueryParams {
  asset_unit_id?: number;
  status?: InventoryMaintenanceStatus;
  page?: number;
  limit?: number;
}

export interface InventoryMaintenanceListResult {
  data: InventoryMaintenance[];
  pagination: InventoryMaintenancePagination;
}
