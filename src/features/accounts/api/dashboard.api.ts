import axiosInstance from '../../../lib/axios';

export interface OpenFinancialYear {
  id: string;
  fyLabel: string;
  startDate: string;
  endDate: string;
}

export interface AccountsDashboardSummary {
  active_ledger_accounts: number;
  open_financial_year: OpenFinancialYear | null;
  vouchers_posted_this_month: number;
  draft_vouchers_pending: number;
  active_cost_centers: number;
}

export async function getDashboardSummary(): Promise<AccountsDashboardSummary> {
  const response = await axiosInstance.get('/accounts/dashboard/summary');
  return response.data.data ?? response.data;
}
