import axiosInstance from '../../../lib/axios';

export interface CanteenTopItem {
  itemId: string;
  itemName: string;
  categoryName: string;
  quantitySold: number;
  totalSales: number;
}

export interface CanteenCategorySales {
  categoryName: string;
  totalItemsSold: number;
  totalSales: number;
}

export interface CanteenPaymentSummary {
  paymentMode: string;
  status: string;
  transactionCount: number;
  totalAmount: number;
}

export interface CanteenDashboardSummary {
  range: { from: string | null; to: string | null };
  members: {
    total_members: number;
    active_wallets: number;
    total_active_wallet_balance: number;
  };
  today: {
    order_count: number;
    revenue: number;
    unpaid_orders: number;
  };
  orders: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    grossSales: number;
    discount: number;
    tax: number;
    netSales: number;
    cashSales: number;
    cardSales: number;
    upiSales: number;
    walletSales: number;
  };
  top_items: CanteenTopItem[];
  category_sales: CanteenCategorySales[];
  payment_summary: CanteenPaymentSummary[];
  pos: {
    active_shifts: number;
    totalShifts: number;
    closedShiftsCount: number;
    openShiftsCount: number;
    totalOpeningCash: number;
    totalExpectedCash: number;
    totalClosingCash: number;
    totalVariance: number;
  };
}

export async function getDashboardSummary(): Promise<CanteenDashboardSummary> {
  const response = await axiosInstance.get('/canteen/dashboard/summary');
  return response.data.data ?? response.data;
}
