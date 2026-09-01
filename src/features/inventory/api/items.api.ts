import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  InventoryItem,
  InventoryItemFormData,
  InventoryItemUpdateData,
  InventoryItemListResult,
  InventoryItemQueryParams,
  InventoryItemVendor,
  InventoryItemVendorFormData,
} from '../types/item.types';

export async function getItems(params?: InventoryItemQueryParams): Promise<InventoryItemListResult> {
  const response = await axiosInstance.get('/inventory/items', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function getItem(id: string | number): Promise<InventoryItem> {
  const response = await axiosInstance.get(`/inventory/items/${id}`);
  return response.data.data || response.data;
}

export async function createItem(data: InventoryItemFormData): Promise<InventoryItem> {
  const response = await axiosInstance.post('/inventory/items', cleanPayload(data));
  return response.data.data || response.data;
}

export async function updateItem(id: string | number, data: InventoryItemUpdateData): Promise<InventoryItem> {
  const response = await axiosInstance.patch(`/inventory/items/${id}`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function getItemVendors(id: string | number): Promise<InventoryItemVendor[]> {
  const response = await axiosInstance.get(`/inventory/items/${id}/vendors`);
  return response.data.data || response.data || [];
}

export async function upsertItemVendor(
  id: string | number,
  data: InventoryItemVendorFormData
): Promise<InventoryItemVendor> {
  const response = await axiosInstance.post(`/inventory/items/${id}/vendors`, data);
  return response.data.data || response.data;
}
