import axiosInstance from '../../../lib/axios';

export interface SportsDashboardSummary {
  total_participants: number;
  ongoing_tournaments: number;
  total_houses: number;
  total_records: number;
  upcoming_fixtures: number;
}

export async function getDashboardSummary(): Promise<SportsDashboardSummary> {
  const response = await axiosInstance.get('/sports/dashboard/summary');
  return response.data.data ?? response.data;
}
