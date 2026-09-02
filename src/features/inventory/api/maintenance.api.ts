import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  InventoryMaintenance,
  InventoryMaintenanceFormData,
  InventoryMaintenanceUpdateData,
  InventoryMaintenanceQueryParams,
  InventoryMaintenanceListResult,
} from '../types/maintenance.types';

export async function getMaintenanceRecords(
  params?: InventoryMaintenanceQueryParams
): Promise<InventoryMaintenanceListResult> {
  const response = await axiosInstance.get('/inventory/maintenance', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function getMaintenanceRecord(id: string | number): Promise<InventoryMaintenance> {
  const response = await axiosInstance.get(`/inventory/maintenance/${id}`);
  return response.data.data || response.data;
}

export async function createMaintenanceRecord(data: InventoryMaintenanceFormData): Promise<InventoryMaintenance> {
  const response = await axiosInstance.post('/inventory/maintenance', cleanPayload(data));
  return response.data.data || response.data;
}

export async function updateMaintenanceRecord(
  id: string | number,
  data: InventoryMaintenanceUpdateData
): Promise<InventoryMaintenance> {
  const response = await axiosInstance.patch(`/inventory/maintenance/${id}`, cleanPayload(data));
  return response.data.data || response.data;
}
