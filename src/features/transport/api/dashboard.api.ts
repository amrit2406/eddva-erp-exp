import axiosInstance from '../../../lib/axios';

export interface TransportDashboardSummary {
  active_vehicles: number;
  total_routes: number;
  active_passengers: number;
  fee_collection_this_month: number;
  unresolved_alerts: number;
}

export async function getDashboardSummary(): Promise<TransportDashboardSummary> {
  const response = await axiosInstance.get('/transport/dashboard/summary');
  return response.data.data ?? response.data;
}
