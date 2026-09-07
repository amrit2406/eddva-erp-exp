export type AccountGroupNature = 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE' | 'EQUITY';

export interface AccountGroup {
  id: string;
  groupName: string;
  parentGroupId?: string | null;
  parentGroup?: { id: string; groupName: string } | null;
  nature: AccountGroupNature | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountGroupFormData {
  groupName: string;
  parentGroupId?: string;
  nature: AccountGroupNature;
}

export type AccountGroupUpdateData = AccountGroupFormData;

export type OpeningBalanceType = 'DEBIT' | 'CREDIT';

export interface LedgerAccount {
  id: string;
  accountCode: string;
  accountName: string;
  groupId: string;
  group?: { id: string; groupName: string } | null;
  openingBalance: number;
  openingBalanceType: OpeningBalanceType | string;
  allowVoucherEntry: boolean;
  isActive: boolean;
  isCashAccount: boolean;
  isBankAccount: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LedgerAccountFormData {
  accountCode: string;
  accountName: string;
  groupId: string;
  openingBalance: number;
  openingBalanceType: OpeningBalanceType;
  allowVoucherEntry: boolean;
  isActive: boolean;
  isCashAccount: boolean;
  isBankAccount: boolean;
}

export interface LedgerAccountUpdateData {
  accountCode: string;
  accountName: string;
  groupId: string;
  allowVoucherEntry: boolean;
  isActive: boolean;
  isCashAccount: boolean;
  isBankAccount: boolean;
}
