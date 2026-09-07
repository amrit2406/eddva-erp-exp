import type { LedgerAccount } from './coa.types';
import type { CostCenter } from './costCenter.types';

export type VoucherTypeCode = 'PAYMENT' | 'RECEIPT' | 'JOURNAL' | 'CONTRA';
export type VoucherStatus = 'DRAFT' | 'POSTED' | 'CANCELLED';

export interface VoucherEntry {
  id?: string;
  accountId: string;
  account?: LedgerAccount;
  debitAmount: number;
  creditAmount: number;
  costCenterId?: string | null;
  costCenter?: CostCenter | null;
  narration?: string | null;
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
  voucherNo?: string;
  voucherTypeCode: VoucherTypeCode | string;
  fyId: string;
  voucherDate: string;
  narration?: string | null;
  referenceNo?: string | null;
  status: VoucherStatus | string;
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
