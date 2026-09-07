import axiosInstance from '../../../lib/axios';
import type { FinancialYear, FinancialYearFormData } from '../types/financialYear.types';

export async function getFinancialYears(): Promise<FinancialYear[]> {
  const response = await axiosInstance.get('/accounts/financial-years');
  return response.data.data || response.data || [];
}

export async function getFinancialYear(id: string): Promise<FinancialYear> {
  const response = await axiosInstance.get(`/accounts/financial-years/${id}`);
  return response.data.data || response.data;
}

export async function createFinancialYear(data: FinancialYearFormData): Promise<FinancialYear> {
  const response = await axiosInstance.post('/accounts/financial-years', data);
  return response.data.data || response.data;
}

export async function closeFinancialYear(id: string): Promise<FinancialYear> {
  const response = await axiosInstance.post(`/accounts/financial-years/${id}/close`);
  return response.data.data || response.data;
}

export async function getOpenFinancialYear(): Promise<FinancialYear | undefined> {
  const years = await getFinancialYears();
  return years.find((fy) => fy.status === 'OPEN');
}
