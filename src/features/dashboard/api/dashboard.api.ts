import axiosInstance from '../../../lib/axios';
import type { DashboardData } from '../types/dashboard.types';

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await axiosInstance.get('/dashboard/summary');
  return response.data.data ?? response.data;
};
