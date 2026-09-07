export type VoucherTypeCode = 'PAYMENT' | 'RECEIPT' | 'JOURNAL' | 'CONTRA';
export type VoucherStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

export interface VoucherType {
  id: string;
  code: VoucherTypeCode | string;
  name: string;
  prefix?: string;
  isActive?: boolean;
}

export interface VoucherEntryAccountRef {
  id?: string;
  accountCode: string;
  accountName: string;
}

export interface VoucherEntry {
  id?: string;
  voucherId?: string;
  accountId: string;
  account?: VoucherEntryAccountRef;
  debitAmount: string | number;
  creditAmount: string | number;
  costCenterId?: string | null;
  narration?: string | null;
  voucherDate?: string;
}

export interface VoucherEntryFormData {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  costCenterId?: string;
  narration?: string;
}

export interface Voucher {
  id: string;
  instituteId?: string;
  voucherNumber: string;
  voucherTypeId: string;
  voucherType?: VoucherType;
  fyId: string;
  financialYear?: { id: string; fyLabel: string };
  voucherDate: string;
  narration?: string | null;
  referenceNo?: string | null;
  totalDebit: string | number;
  totalCredit: string | number;
  status: VoucherStatus | string;
  cancelledAt?: string | null;
  cancelledBy?: string | null;
  reversalOfId?: string | null;
  entries: VoucherEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface VoucherFormData {
  voucherTypeCode: VoucherTypeCode;
  fyId: string;
  voucherDate: string;
  narration?: string;
  referenceNo?: string;
  entries: VoucherEntryFormData[];
}

export interface VoucherUpdateData {
  voucherDate: string;
  narration?: string;
  referenceNo?: string;
  entries: VoucherEntryFormData[];
}

export interface VoucherCancelFormData {
  reason: string;
}
