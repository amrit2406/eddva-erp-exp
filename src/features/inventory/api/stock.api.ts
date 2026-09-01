import axiosInstance from '../../../lib/axios';
import type {
  InventoryStockPurchase,
  InventoryStockPurchaseFormData,
  InventoryPurchaseQueryParams,
  InventoryStockPurchaseListResult,
  InventoryStockTransfer,
  InventoryStockTransferFormData,
  InventoryTransferQueryParams,
  InventoryStockTransferListResult,
  InventoryStockAdjustment,
  InventoryStockAdjustmentFormData,
  InventoryAdjustmentQueryParams,
  InventoryStockAdjustmentListResult,
  InventoryBalanceQueryParams,
  InventoryStockBalanceListResult,
  InventoryLedgerQueryParams,
  InventoryStockLedgerListResult,
  InventoryReconcileResult,
} from '../types/stock.types';

// ─── Purchases ──────────────────────────────────────────────────────────

export async function getPurchases(params?: InventoryPurchaseQueryParams): Promise<InventoryStockPurchaseListResult> {
  const response = await axiosInstance.get('/inventory/stock/purchases', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function getPurchase(id: string | number): Promise<InventoryStockPurchase> {
  const response = await axiosInstance.get(`/inventory/stock/purchases/${id}`);
  return response.data.data || response.data;
}

export async function createPurchase(data: InventoryStockPurchaseFormData): Promise<InventoryStockPurchase> {
  const response = await axiosInstance.post('/inventory/stock/purchases', data);
  return response.data.data || response.data;
}

// ─── Transfers ──────────────────────────────────────────────────────────

export async function getTransfers(params?: InventoryTransferQueryParams): Promise<InventoryStockTransferListResult> {
  const response = await axiosInstance.get('/inventory/stock/transfers', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function getTransfer(id: string | number): Promise<InventoryStockTransfer> {
  const response = await axiosInstance.get(`/inventory/stock/transfers/${id}`);
  return response.data.data || response.data;
}

export async function createTransfer(data: InventoryStockTransferFormData): Promise<InventoryStockTransfer> {
  const response = await axiosInstance.post('/inventory/stock/transfers', data);
  return response.data.data || response.data;
}

// ─── Adjustments ────────────────────────────────────────────────────────

export async function getAdjustments(
  params?: InventoryAdjustmentQueryParams
): Promise<InventoryStockAdjustmentListResult> {
  const response = await axiosInstance.get('/inventory/stock/adjustments', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function getAdjustment(id: string | number): Promise<InventoryStockAdjustment> {
  const response = await axiosInstance.get(`/inventory/stock/adjustments/${id}`);
  return response.data.data || response.data;
}

export async function createAdjustment(data: InventoryStockAdjustmentFormData): Promise<InventoryStockAdjustment> {
  const response = await axiosInstance.post('/inventory/stock/adjustments', data);
  return response.data.data || response.data;
}

// ─── Balances / Ledger / Reconcile ───────────────────────────────────────

export async function getBalances(params?: InventoryBalanceQueryParams): Promise<InventoryStockBalanceListResult> {
  const response = await axiosInstance.get('/inventory/stock/balances', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function getLedger(params?: InventoryLedgerQueryParams): Promise<InventoryStockLedgerListResult> {
  const response = await axiosInstance.get('/inventory/stock/ledger', { params });
  return {
    data: response.data.data?.data || response.data.data || [],
    pagination: response.data.data?.pagination || response.data.pagination,
  };
}

export async function reconcileStock(itemId?: string | number): Promise<InventoryReconcileResult> {
  const response = await axiosInstance.post('/inventory/stock/reconcile', undefined, {
    params: itemId ? { item_id: itemId } : undefined,
  });
  return response.data.data || response.data;
}
