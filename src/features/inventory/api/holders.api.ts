import axiosInstance from '../../../lib/axios';
import { cleanPayload } from '../utils/cleanPayload';
import type {
  InventoryHolder,
  InventoryHolderFormData,
  InventoryHolderUpdateData,
  InventoryHolderQueryParams,
  InventoryHolderListResult,
  InventoryHolderCurrentIssue,
} from '../types/holder.types';

export async function getHolders(params?: InventoryHolderQueryParams): Promise<InventoryHolderListResult> {
  const response = await axiosInstance.get('/inventory/holders', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function getHolder(id: string | number): Promise<InventoryHolder> {
  const response = await axiosInstance.get(`/inventory/holders/${id}`);
  return response.data.data || response.data;
}

export async function createHolder(data: InventoryHolderFormData): Promise<InventoryHolder> {
  const response = await axiosInstance.post('/inventory/holders', cleanPayload(data));
  return response.data.data || response.data;
}

export async function updateHolder(id: string | number, data: InventoryHolderUpdateData): Promise<InventoryHolder> {
  const response = await axiosInstance.patch(`/inventory/holders/${id}`, cleanPayload(data));
  return response.data.data || response.data;
}

export async function getHolderCurrentIssues(id: string | number): Promise<InventoryHolderCurrentIssue[]> {
  const response = await axiosInstance.get(`/inventory/holders/${id}/current-issues`);
  return response.data.data || response.data || [];
}
