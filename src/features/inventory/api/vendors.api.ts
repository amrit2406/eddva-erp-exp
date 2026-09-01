import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type { InventoryVendor, InventoryVendorFormData, InventoryVendorUpdateData } from '../types/vendor.types';

export async function getVendors(search?: string): Promise<InventoryVendor[]> {
  const response = await axiosInstance.get('/inventory/vendors', {
    params: search ? { search } : undefined,
  });
  return response.data.data || response.data || [];
}

export async function getVendor(id: string | number): Promise<InventoryVendor> {
  const response = await axiosInstance.get(`/inventory/vendors/${id}`);
  return response.data.data || response.data;
}

export async function createVendor(data: InventoryVendorFormData): Promise<InventoryVendor> {
  const response = await axiosInstance.post('/inventory/vendors', cleanPayload(data));
  return response.data.data || response.data;
}

export async function updateVendor(
  id: string | number,
  data: InventoryVendorUpdateData
): Promise<InventoryVendor> {
  const response = await axiosInstance.patch(`/inventory/vendors/${id}`, cleanPayload(data));
  return response.data.data || response.data;
}
