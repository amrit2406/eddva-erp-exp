import axiosInstance from '../../../lib/axios';
import type {
  LedgerReport,
  AccountBookReport,
  TrialBalanceReport,
  BalanceSheetReport,
  IncomeExpenditureReport,
} from '../types/report.types';
import type { Voucher } from '../types/voucher.types';

export async function getLedgerReport(accountId: string, from: string, to: string): Promise<LedgerReport> {
  const response = await axiosInstance.get(`/accounts/reports/ledger/${accountId}`, {
    params: { from, to },
  });
  return response.data.data || response.data;
}

export async function getDayBook(from?: string, to?: string): Promise<Voucher[]> {
  const params = from && to ? { from, to } : undefined;
  const response = await axiosInstance.get('/accounts/reports/day-book', { params });
  return response.data.data || response.data || [];
}

export async function getCashBook(from: string, to: string): Promise<AccountBookReport> {
  const response = await axiosInstance.get('/accounts/reports/cash-book', { params: { from, to } });
  return response.data.data || response.data;
}

export async function getBankBook(from: string, to: string): Promise<AccountBookReport> {
  const response = await axiosInstance.get('/accounts/reports/bank-book', { params: { from, to } });
  return response.data.data || response.data;
}

export async function getTrialBalance(fyId: string): Promise<TrialBalanceReport> {
  const response = await axiosInstance.get('/accounts/reports/trial-balance', { params: { fy_id: fyId } });
  return response.data.data || response.data;
}

export async function downloadTrialBalancePdf(fyId: string): Promise<Blob> {
  const response = await axiosInstance.get('/accounts/reports/trial-balance/pdf', {
    params: { fy_id: fyId },
    responseType: 'blob',
  });
  return response.data;
}

export async function getBalanceSheet(asOf: string): Promise<BalanceSheetReport> {
  const response = await axiosInstance.get('/accounts/reports/balance-sheet', { params: { as_of: asOf } });
  return response.data.data || response.data;
}

export async function downloadBalanceSheetPdf(asOf: string): Promise<Blob> {
  const response = await axiosInstance.get('/accounts/reports/balance-sheet/pdf', {
    params: { as_of: asOf },
    responseType: 'blob',
  });
  return response.data;
}

export async function getIncomeExpenditure(from: string, to: string): Promise<IncomeExpenditureReport> {
  const response = await axiosInstance.get('/accounts/reports/income-expenditure', {
    params: { from, to },
  });
  return response.data.data || response.data;
}
