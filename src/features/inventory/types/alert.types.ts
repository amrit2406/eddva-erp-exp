export interface InventoryLowStockLocationBreakdown {
  location_id: number;
  location: string;
  quantity: number;
}

export interface InventoryLowStockAlert {
  item_id: number;
  item_code: string;
  name: string;
  category: string;
  unit_of_measure: string;
  reorder_level: number;
  total_stock: number;
  by_location: InventoryLowStockLocationBreakdown[];
}
