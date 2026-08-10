import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../constants/queryKeys';
import { getDashboardData } from '../api/dashboard.api';

export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn: getDashboardData,
  });
}
