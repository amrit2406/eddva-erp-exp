import axiosInstance from '../../../lib/axios';
import type { CostCenter, CostCenterFormData, CostCenterUpdateData } from '../types/costCenter.types';

export async function getCostCenters(): Promise<CostCenter[]> {
  const response = await axiosInstance.get('/accounts/cost-centers');
  return response.data.data || response.data || [];
}

export async function getCostCenter(id: string): Promise<CostCenter> {
  const response = await axiosInstance.get(`/accounts/cost-centers/${id}`);
  return response.data.data || response.data;
}

export async function createCostCenter(data: CostCenterFormData): Promise<CostCenter> {
  const response = await axiosInstance.post('/accounts/cost-centers', data);
  return response.data.data || response.data;
}

export async function updateCostCenter(id: string, data: CostCenterUpdateData): Promise<CostCenter> {
  const response = await axiosInstance.patch(`/accounts/cost-centers/${id}`, data);
  return response.data.data || response.data;
}
