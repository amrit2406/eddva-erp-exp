import axiosInstance from '../../../lib/axios';

export interface CanteenDashboardSummary {
  total_members: number;
  total_active_wallet_balance: number;
  todays_order_count: number;
  todays_revenue: number;
  active_pos_shifts: number;
  unpaid_orders: number;
}

export async function getDashboardSummary(): Promise<CanteenDashboardSummary> {
  const response = await axiosInstance.get('/canteen/dashboard/summary');
  return response.data.data ?? response.data;
}
