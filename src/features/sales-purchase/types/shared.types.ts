// Shared Types for Sales & Purchase Module

export type ItemStatus = 'active' | 'inactive';

export interface Item {
  itemId: string;
  itemCode: string;
  itemName: string;
  categoryId?: string;
  categoryName?: string;
  uomId?: string;
  uomName?: string;
  hsnSacCode?: string;
  purchasePrice?: number;
  salesPrice?: number;
  taxCodeId?: string;
  taxCodeName?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaxCode {
  taxCodeId: string;
  name: string;
  cgstPct: number;
  sgstPct: number;
  igstPct: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface PaymentTerm {
  termId: string;
  termName: string;
  days: number;
  description?: string;
  isActive: boolean;
}

export interface Warehouse {
  warehouseId: string;
  name: string;
  address?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface ItemSelectOption {
  value: string;
  label: string;
  code: string;
  category?: string;
  uom?: string;
  purchasePrice?: number;
  salesPrice?: number;
}

export interface TaxCodeSelectOption {
  value: string;
  label: string;
  cgstPct: number;
  sgstPct: number;
  igstPct: number;
}

export interface PaymentTermSelectOption {
  value: string;
  label: string;
  days: number;
}

export interface WarehouseSelectOption {
  value: string;
  label: string;
  address?: string;
  isDefault?: boolean;
}
