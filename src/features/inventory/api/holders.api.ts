import axiosInstance from '../../../lib/axios';
import type { InventoryHolder, InventoryHolderType } from '../types/holder.types';

// Minimal read-only client for the Holders module — used to populate the
// holder picker on the Issues form. Full Holders CRUD UI is a separate module.
export async function getHolders(params?: { search?: string; holder_type?: InventoryHolderType }): Promise<InventoryHolder[]> {
  const response = await axiosInstance.get('/inventory/holders', { params: { ...params, limit: 200 } });
  return response.data.data?.data || response.data.data || [];
}
