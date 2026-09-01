import axiosInstance from '../../../lib/axios';
import type { InventoryCategory, InventoryCategoryFormData, InventoryCategoryUpdateData } from '../types/category.types';

export async function getCategories(search?: string): Promise<InventoryCategory[]> {
  const response = await axiosInstance.get('/inventory/categories', {
    params: search ? { search } : undefined,
  });
  return response.data.data || response.data || [];
}

export async function getCategory(id: string | number): Promise<InventoryCategory> {
  const response = await axiosInstance.get(`/inventory/categories/${id}`);
  return response.data.data || response.data;
}

export async function createCategory(data: InventoryCategoryFormData): Promise<InventoryCategory> {
  const response = await axiosInstance.post('/inventory/categories', data);
  return response.data.data || response.data;
}

export async function updateCategory(
  id: string | number,
  data: InventoryCategoryUpdateData
): Promise<InventoryCategory> {
  const response = await axiosInstance.patch(`/inventory/categories/${id}`, data);
  return response.data.data || response.data;
}
