import axiosInstance from '../../../lib/axios';

export interface OpenFinancialYear {
  id: string;
  fyLabel: string;
  startDate: string;
  endDate: string;
}

export interface LedgerAccountRef {
  id: string;
  accountCode: string;
  accountName: string;
}

export interface GroupBalance {
  accounts: LedgerAccountRef[];
  balance: { amount: number; type: 'DEBIT' | 'CREDIT' };
}

export interface AccountsDashboardSummary {
  range: { from: string | null; to: string | null };
  overview: {
    active_ledger_accounts: number;
    active_cost_centers: number;
    open_financial_year: OpenFinancialYear | null;
  };
  vouchers: {
    draft_pending: number;
    by_status: { status: string; count: number }[];
    by_type: { voucher_type: string; count: number; total_debit: number }[];
  };
  cash_and_bank: {
    cash: GroupBalance;
    bank: GroupBalance;
  };
}

export async function getDashboardSummary(): Promise<AccountsDashboardSummary> {
  const response = await axiosInstance.get('/accounts/dashboard/summary');
  return response.data.data ?? response.data;
}
