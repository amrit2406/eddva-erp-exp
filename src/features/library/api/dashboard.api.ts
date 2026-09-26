import axiosInstance from '../../../lib/axios';

export interface LibraryStatusCount {
  status: string;
  count: number;
}

export interface LibraryDashboardSummary {
  range: { from: string | null; to: string | null };
  catalog: {
    total_books: number;
    total_copies: number;
    available_copies: number;
  };
  members: {
    total_members: number;
    active_members: number;
  };
  issues: {
    currently_issued: number;
    overdue: number;
    lost: number;
    issued_in_range: number;
    returned_in_range: number;
    by_status: LibraryStatusCount[];
  };
  reservations: {
    pending: number;
    ready_for_pickup: number;
    by_status: LibraryStatusCount[];
  };
  fines: {
    pending_total: number;
    // Shape assumed from the other by_status lists; the sample response had none.
    by_status_in_range: LibraryStatusCount[];
  };
}

export async function getDashboardSummary(): Promise<LibraryDashboardSummary> {
  const response = await axiosInstance.get('/library/dashboard/summary');
  return response.data.data ?? response.data;
}
