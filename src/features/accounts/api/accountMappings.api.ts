import axiosInstance from '../../../lib/axios';
import type { AccountMapping, AccountMappingFormData } from '../types/accountMapping.types';

export async function getAccountMappings(): Promise<AccountMapping[]> {
  const response = await axiosInstance.get('/accounts/account-mappings');
  return response.data.data || response.data || [];
}

// POST upserts by mappingKey — same id and 201 status returned whether the key
// is new or already mapped to a different account; verified against the live API.
export async function upsertAccountMapping(data: AccountMappingFormData): Promise<AccountMapping> {
  const response = await axiosInstance.post('/accounts/account-mappings', data);
  return response.data.data || response.data;
}
