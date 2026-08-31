import axiosInstance from '../../../lib/axios';
import type { FrontOfficeDashboardSummary } from '../types/dashboardRecord.types';

export async function getDashboardSummary(): Promise<FrontOfficeDashboardSummary> {
  const response = await axiosInstance.get('/front-office/dashboard/summary');
  return response.data.data || response.data;
}
