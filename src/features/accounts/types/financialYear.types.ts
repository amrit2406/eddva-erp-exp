export type FinancialYearStatus = 'OPEN' | 'CLOSED';

export interface FinancialYear {
  id: string;
  fyLabel: string;
  startDate: string;
  endDate: string;
  status: FinancialYearStatus | string;
  closedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialYearFormData {
  fyLabel: string;
  startDate: string;
  endDate: string;
}
