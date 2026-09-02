export interface InventoryDashboardStockByLocation {
  location_id: number;
  location: string;
  quantity: number;
}

export interface InventoryDashboardAssetsByStatus {
  status: string;
  count: number;
}

export interface InventoryDashboardAssets {
  total: number;
  issued: number;
  idle: number;
  utilization_pct: number;
  by_status: InventoryDashboardAssetsByStatus[];
}

export interface InventoryDashboardCategoryConsumption {
  category: string;
  issue_count: number;
}

export interface InventoryDashboardVendorPurchase {
  vendor_id: number;
  vendor: string;
  purchase_count: number;
  total_amount: number;
}

export interface InventoryDashboardSummary {
  range: { from: string | null; to: string | null };
  total_items: number;
  low_stock_items: number;
  stock_by_location: InventoryDashboardStockByLocation[];
  todays_issues: number;
  overdue_returns: number;
  assets: InventoryDashboardAssets;
  category_wise_consumption: InventoryDashboardCategoryConsumption[];
  vendor_wise_purchases: InventoryDashboardVendorPurchase[];
  stock_valuation: number;
}

export interface InventoryDashboardQueryParams {
  from?: string;
  to?: string;
}
