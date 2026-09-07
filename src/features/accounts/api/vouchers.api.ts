import axiosInstance from '../../../lib/axios';
import type { Voucher, VoucherFormData, VoucherUpdateData, VoucherCancelFormData } from '../types/voucher.types';

export async function getVouchers(): Promise<Voucher[]> {
  const response = await axiosInstance.get('/accounts/vouchers');
  return response.data.data || response.data || [];
}

export async function getVoucher(id: string): Promise<Voucher> {
  const response = await axiosInstance.get(`/accounts/vouchers/${id}`);
  return response.data.data || response.data;
}

export async function createVoucher(data: VoucherFormData): Promise<Voucher> {
  const response = await axiosInstance.post('/accounts/vouchers', data);
  return response.data.data || response.data;
}

export async function updateVoucher(id: string, data: VoucherUpdateData): Promise<Voucher> {
  const response = await axiosInstance.patch(`/accounts/vouchers/${id}`, data);
  return response.data.data || response.data;
}

export async function postVoucher(id: string): Promise<Voucher> {
  const response = await axiosInstance.post(`/accounts/vouchers/${id}/post`);
  return response.data.data || response.data;
}

export async function cancelVoucher(id: string, data: VoucherCancelFormData): Promise<Voucher> {
  const response = await axiosInstance.post(`/accounts/vouchers/${id}/cancel`, data);
  return response.data.data || response.data;
}
