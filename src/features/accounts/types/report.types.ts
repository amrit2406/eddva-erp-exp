export interface ReportAmount {
  amount: number;
  type: 'DEBIT' | 'CREDIT' | string;
}

export interface AccountBookEntry {
  voucherDate: string;
  voucherNumber: string;
  account?: string;
  voucherType?: string;
  narration?: string | null;
  debit: number;
  credit: number;
  runningBalance: number;
  runningBalanceType: string;
}

export interface AccountBookReport {
  accounts: { id: string; accountCode: string; accountName: string }[];
  openingBalance: ReportAmount;
  closingBalance: ReportAmount;
  entries: AccountBookEntry[];
}

export interface LedgerReport {
  account: { id: string; accountCode: string; accountName: string };
  openingBalance: ReportAmount;
  closingBalance: ReportAmount;
  entries: AccountBookEntry[];
}

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  groupName?: string;
  nature?: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceReport {
  fy?: { id: string; fyLabel: string };
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  isBalanced?: boolean;
}

export interface BalanceSheetLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
  balanceType: string;
}

export interface BalanceSheetReport {
  asOf: string;
  assets: BalanceSheetLine[];
  liabilities: BalanceSheetLine[];
  equity: BalanceSheetLine[];
  currentPeriodSurplus?: number;
  totals: { assets: number; liabilitiesAndEquity: number };
  isBalanced?: boolean;
}

export interface IncomeExpenditureLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  amount: number;
}

export interface IncomeExpenditureReport {
  from: string;
  to: string;
  income: IncomeExpenditureLine[];
  expenditure: IncomeExpenditureLine[];
  totalIncome: number;
  totalExpenditure: number;
  surplusOrDeficit: number;
}
