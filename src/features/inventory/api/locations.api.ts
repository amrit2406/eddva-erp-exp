import axiosInstance from '../../../lib/axios';
import type {
  InventoryLocation,
  InventoryLocationFormData,
  InventoryLocationUpdateData,
  InventoryLocationQueryParams,
} from '../types/location.types';

export async function getLocations(params?: InventoryLocationQueryParams): Promise<InventoryLocation[]> {
  const response = await axiosInstance.get('/inventory/locations', { params });
  return response.data.data || response.data || [];
}

export async function getLocation(id: string | number): Promise<InventoryLocation> {
  const response = await axiosInstance.get(`/inventory/locations/${id}`);
  return response.data.data || response.data;
}

export async function createLocation(data: InventoryLocationFormData): Promise<InventoryLocation> {
  const response = await axiosInstance.post('/inventory/locations', data);
  return response.data.data || response.data;
}

export async function updateLocation(
  id: string | number,
  data: InventoryLocationUpdateData
): Promise<InventoryLocation> {
  const response = await axiosInstance.patch(`/inventory/locations/${id}`, data);
  return response.data.data || response.data;
}
