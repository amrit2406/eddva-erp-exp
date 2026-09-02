import axiosInstance from '../../../lib/axios';
import type { InventoryDashboardSummary, InventoryDashboardQueryParams } from '../types/dashboard.types';

export async function getDashboardSummary(params?: InventoryDashboardQueryParams): Promise<InventoryDashboardSummary> {
  const response = await axiosInstance.get('/inventory/dashboard/summary', { params });
  return response.data.data || response.data;
}
