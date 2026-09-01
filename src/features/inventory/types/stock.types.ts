export interface StockPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ItemRef {
  item_id: number;
  name: string;
  item_code: string;
}

interface VendorRef {
  vendor_id: number;
  name: string;
}

interface LocationRef {
  location_id: number;
  name: string;
}

// ─── Purchases ──────────────────────────────────────────────────────────

export interface InventoryAssetUnit {
  asset_unit_id: number;
  item_id: number;
  asset_tag: string;
  serial_number?: string | null;
  status: 'in_store' | 'issued' | 'under_repair' | 'disposed' | 'lost';
  current_location_id?: number | null;
  purchase_date?: string | null;
  warranty_expiry?: string | null;
}

export interface InventoryStockPurchase {
  purchase_id: number;
  item_id: number;
  item?: ItemRef;
  vendor_id: number;
  vendor?: VendorRef;
  location_id: number;
  location?: LocationRef;
  quantity: number;
  unit_price: number;
  total_amount: number;
  invoice_number?: string | null;
  purchase_date: string;
  created_by?: string | null;
  created_at: string;
  asset_units?: InventoryAssetUnit[];
}

export interface InventoryStockPurchaseFormData {
  item_id: number;
  vendor_id: number;
  location_id: number;
  quantity: number;
  unit_price: number;
  invoice_number?: string;
  purchase_date: string;
  asset_tags?: string[];
}

export interface InventoryPurchaseQueryParams {
  vendor_id?: number;
  item_id?: number;
  location_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface InventoryStockPurchaseListResult {
  data: InventoryStockPurchase[];
  pagination: StockPagination;
}

// ─── Transfers ──────────────────────────────────────────────────────────

export interface InventoryStockTransfer {
  transfer_id: number;
  item_id: number;
  item?: ItemRef;
  from_location_id: number;
  from_location?: LocationRef;
  to_location_id: number;
  to_location?: LocationRef;
  quantity: number;
  transfer_date: string;
  created_by?: string | null;
  created_at: string;
}

export interface InventoryStockTransferFormData {
  item_id: number;
  from_location_id: number;
  to_location_id: number;
  quantity: number;
  transfer_date: string;
}

export interface InventoryTransferQueryParams {
  item_id?: number;
  location_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface InventoryStockTransferListResult {
  data: InventoryStockTransfer[];
  pagination: StockPagination;
}

// ─── Adjustments ────────────────────────────────────────────────────────

export type InventoryAdjustmentReason = 'damaged' | 'expired' | 'lost' | 'audit_correction';

export interface InventoryStockAdjustment {
  adjustment_id: number;
  item_id: number;
  item?: ItemRef;
  location_id: number;
  location?: LocationRef;
  quantity_delta: number;
  reason: InventoryAdjustmentReason;
  remarks?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface InventoryStockAdjustmentFormData {
  item_id: number;
  location_id: number;
  quantity_delta: number;
  reason: InventoryAdjustmentReason;
  remarks?: string;
}

export interface InventoryAdjustmentQueryParams {
  item_id?: number;
  location_id?: number;
  reason?: InventoryAdjustmentReason;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface InventoryStockAdjustmentListResult {
  data: InventoryStockAdjustment[];
  pagination: StockPagination;
}

// ─── Balances / Ledger / Reconcile ───────────────────────────────────────

interface BalanceItemRef {
  item_id: number;
  name: string;
  item_code: string;
  reorder_level: number;
  unit_of_measure: string;
}

export interface InventoryStockBalance {
  item_id: number;
  location_id: number;
  item?: BalanceItemRef;
  location?: LocationRef;
  quantity: number;
  updated_at: string;
}

export interface InventoryBalanceQueryParams {
  item_id?: number;
  location_id?: number;
  page?: number;
  limit?: number;
}

export interface InventoryStockBalanceListResult {
  data: InventoryStockBalance[];
  pagination: StockPagination;
}

export type InventoryLedgerTransactionType =
  | 'purchase_in'
  | 'transfer_out'
  | 'transfer_in'
  | 'adjustment_in'
  | 'adjustment_out'
  | 'issue_out'
  | 'return_in';

export type InventoryLedgerReferenceType = 'purchase' | 'transfer' | 'adjustment' | 'issue' | 'return';

export interface InventoryStockLedgerEntry {
  ledger_id: number;
  item_id: number;
  item?: ItemRef;
  location_id: number;
  location?: LocationRef;
  transaction_type: InventoryLedgerTransactionType;
  quantity: number;
  balance_after: number;
  reference_type: InventoryLedgerReferenceType;
  reference_id: number;
  created_by?: string | null;
  created_at: string;
}

export interface InventoryLedgerQueryParams {
  item_id?: number;
  location_id?: number;
  transaction_type?: InventoryLedgerTransactionType;
  reference_type?: InventoryLedgerReferenceType;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface InventoryStockLedgerListResult {
  data: InventoryStockLedgerEntry[];
  pagination: StockPagination;
}

export interface InventoryReconcileResult {
  reconciled_rows: number;
  balances: Array<{ item_id: number; location_id: number; quantity: number; updated_at: string }>;
}
