import axiosInstance from '../../../lib/axios';
import type { InventoryLowStockAlert } from '../types/alert.types';
import type { InventoryIssue } from '../types/issue.types';

export async function getLowStockAlerts(): Promise<InventoryLowStockAlert[]> {
  const response = await axiosInstance.get('/inventory/alerts/low-stock');
  return response.data.data || response.data || [];
}

export async function getOverdueReturnAlerts(): Promise<InventoryIssue[]> {
  const response = await axiosInstance.get('/inventory/alerts/overdue-returns');
  return response.data.data || response.data || [];
}
