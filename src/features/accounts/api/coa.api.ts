import axiosInstance from '../../../lib/axios';
import type {
  AccountGroup,
  AccountGroupFormData,
  AccountGroupUpdateData,
  LedgerAccount,
  LedgerAccountFormData,
  LedgerAccountUpdateData,
} from '../types/coa.types';

export async function getAccountGroups(): Promise<AccountGroup[]> {
  const response = await axiosInstance.get('/accounts/account-groups');
  return response.data.data || response.data || [];
}

export async function getAccountGroup(id: string): Promise<AccountGroup> {
  const response = await axiosInstance.get(`/accounts/account-groups/${id}`);
  return response.data.data || response.data;
}

export async function createAccountGroup(data: AccountGroupFormData): Promise<AccountGroup> {
  const response = await axiosInstance.post('/accounts/account-groups', data);
  return response.data.data || response.data;
}

export async function updateAccountGroup(id: string, data: AccountGroupUpdateData): Promise<AccountGroup> {
  const response = await axiosInstance.patch(`/accounts/account-groups/${id}`, data);
  return response.data.data || response.data;
}

export async function getLedgerAccounts(): Promise<LedgerAccount[]> {
  const response = await axiosInstance.get('/accounts/ledger-accounts');
  return response.data.data || response.data || [];
}

export async function getLedgerAccount(id: string): Promise<LedgerAccount> {
  const response = await axiosInstance.get(`/accounts/ledger-accounts/${id}`);
  return response.data.data || response.data;
}

export async function createLedgerAccount(data: LedgerAccountFormData): Promise<LedgerAccount> {
  const response = await axiosInstance.post('/accounts/ledger-accounts', data);
  return response.data.data || response.data;
}

export async function updateLedgerAccount(id: string, data: LedgerAccountUpdateData): Promise<LedgerAccount> {
  const response = await axiosInstance.patch(`/accounts/ledger-accounts/${id}`, data);
  return response.data.data || response.data;
}
