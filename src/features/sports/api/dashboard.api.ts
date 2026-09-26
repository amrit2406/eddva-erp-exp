import axiosInstance from '../../../lib/axios';

export interface SportsStatusCount {
  status: string;
  count: number;
}

export interface SportsHouseStanding {
  house: string;
  color: string;
  total_points: number;
  rank: number;
}

export interface SportsRecentRecord {
  record_id: number;
  description: string;
  value: string;
  achieved_date: string;
}

export interface SportsDashboardSummary {
  range: { from: string | null; to: string | null };
  participants: { total: number };
  tournaments: {
    ongoing: number;
    upcoming: number;
    completed: number;
    started_in_range: number;
    by_status: SportsStatusCount[];
  };
  houses: {
    total: number;
    academic_year: string | null;
    standings: SportsHouseStanding[];
  };
  fixtures: { by_status: SportsStatusCount[] };
  records_and_awards: {
    total_records: number;
    total_awards: number;
    recent_records: SportsRecentRecord[];
  };
}

export async function getDashboardSummary(): Promise<SportsDashboardSummary> {
  const response = await axiosInstance.get('/sports/dashboard/summary');
  return response.data.data ?? response.data;
}
