import axiosInstance from '../../../lib/axios';

export interface TransportDashboardSummary {
  range: { from: string | null; to: string | null };
  fleet: {
    total_vehicles: number;
    active_vehicles: number;
    total_routes: number;
  };
  drivers: {
    active: number;
    on_leave: number;
    inactive: number;
    by_status: { status: string; count: number }[];
  };
  passengers: {
    active: number;
    by_type: { type: string; count: number }[];
  };
  fees: {
    active_subscriptions: number;
    expired_subscriptions: number;
    collection_in_range: number;
    payments_in_range: number;
  };
  alerts: {
    unresolved: number;
    by_type: { type: string; count: number }[];
  };
}

export async function getDashboardSummary(): Promise<TransportDashboardSummary> {
  const response = await axiosInstance.get('/transport/dashboard/summary');
  return response.data.data ?? response.data;
}
