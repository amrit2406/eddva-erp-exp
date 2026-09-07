export interface FinancialYear {
  id: string;
  fyLabel: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialYearFormData {
  fyLabel: string;
  startDate: string;
  endDate: string;
}
