export type MappingKey = 'AR' | 'AP' | 'SALES_INCOME' | 'PURCHASE_EXPENSE' | 'CASH' | 'BANK';

export interface AccountMapping {
  id: string;
  instituteId?: string;
  mappingKey: MappingKey | string;
  accountId: string;
  account?: { accountCode: string; accountName: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountMappingFormData {
  mappingKey: MappingKey;
  accountId: string;
}

export const MAPPING_KEYS: { key: MappingKey; label: string; description: string }[] = [
  { key: 'AR', label: 'Accounts Receivable', description: 'Debited when sales invoices are auto-posted' },
  { key: 'AP', label: 'Accounts Payable', description: 'Credited when purchase invoices are auto-posted' },
  { key: 'SALES_INCOME', label: 'Sales Income', description: 'Credited as revenue on sales invoices' },
  { key: 'PURCHASE_EXPENSE', label: 'Purchase Expense', description: 'Debited as expense on purchase invoices' },
  { key: 'CASH', label: 'Cash', description: 'Default cash account for cash transactions' },
  { key: 'BANK', label: 'Bank', description: 'Default bank account for bank transactions' },
];
