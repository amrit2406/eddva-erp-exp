import axiosInstance from '../../../lib/axios';

export interface LibraryDashboardSummary {
  total_books: number;
  total_members: number;
  currently_issued: number;
  overdue: number;
  pending_fines_total: number;
}

export async function getDashboardSummary(): Promise<LibraryDashboardSummary> {
  const response = await axiosInstance.get('/library/dashboard/summary');
  return response.data.data ?? response.data;
}
