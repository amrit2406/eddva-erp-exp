import axiosInstance from '../../../lib/axios';
import type {
  ItemCategory,
  ItemCategoryFormData,
  UOM,
  UOMFormData,
  TaxCode,
  TaxCodeFormData,
  PaymentTerm,
  PaymentTermFormData,
  Warehouse,
  WarehouseFormData,
  Item,
  ItemFormData,
  Vendor,
  VendorFormData,
  VendorContact,
  VendorBankDetail,
  Customer,
  CustomerFormData,
  CustomerContact,
  PurchaseOrder,
  PurchaseOrderFormData,
  GRN,
  GRNFormData,
  Invoice,
  InvoiceFormData,
  Payment,
  PaymentFormData,
  SalesOrder,
  SalesOrderFormData,
  SalesInvoice,
  SalesInvoiceFormData,
  SalesInvoiceItem,
  SalesReceipt,
  SalesReceiptFormData,
  PurchaseRegisterItem,
  SalesRegisterItem
} from '../types/sales-purchase.types';

// Item Categories
export async function getItemCategories(): Promise<ItemCategory[]> {
  const response = await axiosInstance.get('/item-categories');
  return response.data?.data || response.data;
}

export async function getItemCategory(id: string): Promise<ItemCategory> {
  const response = await axiosInstance.get(`/item-categories/${id}`);
  return response.data?.data || response.data;
}

export async function createItemCategory(data: ItemCategoryFormData): Promise<ItemCategory> {
  const response = await axiosInstance.post('/item-categories', data);
  return response.data?.data || response.data;
}

export async function updateItemCategory(id: string, data: ItemCategoryFormData): Promise<ItemCategory> {
  const response = await axiosInstance.patch(`/item-categories/${id}`, data);
  return response.data?.data || response.data;
}

// UOM
export async function getUOMs(): Promise<UOM[]> {
  const response = await axiosInstance.get('/uom');
  return response.data?.data || response.data;
}

export async function createUOM(data: UOMFormData): Promise<UOM> {
  const response = await axiosInstance.post('/uom', data);
  return response.data?.data || response.data;
}

export async function getUOM(id: string): Promise<UOM> {
  const response = await axiosInstance.get(`/uom/${id}`);
  return response.data?.data || response.data;
}

export async function updateUOM(id: string, data: UOMFormData): Promise<UOM> {
  const response = await axiosInstance.patch(`/uom/${id}`, data);
  return response.data?.data || response.data;
}

// Tax Codes
export async function getTaxCodes(): Promise<TaxCode[]> {
  const response = await axiosInstance.get('/tax-codes');
  return response.data?.data || response.data;
}

export async function createTaxCode(data: TaxCodeFormData): Promise<TaxCode> {
  const response = await axiosInstance.post('/tax-codes', data);
  return response.data?.data || response.data;
}

export async function getTaxCode(id: string): Promise<TaxCode> {
  const response = await axiosInstance.get(`/tax-codes/${id}`);
  return response.data?.data || response.data;
}

export async function updateTaxCode(id: string, data: TaxCodeFormData): Promise<TaxCode> {
  const response = await axiosInstance.patch(`/tax-codes/${id}`, data);
  return response.data?.data || response.data;
}

// Payment Terms
export async function getPaymentTerms(): Promise<PaymentTerm[]> {
  const response = await axiosInstance.get('/payment-terms');
  return response.data?.data || response.data;
}

export async function createPaymentTerm(data: PaymentTermFormData): Promise<PaymentTerm> {
  const response = await axiosInstance.post('/payment-terms', data);
  return response.data?.data || response.data;
}

export async function getPaymentTerm(id: string): Promise<PaymentTerm> {
  const response = await axiosInstance.get(`/payment-terms/${id}`);
  return response.data?.data || response.data;
}

export async function updatePaymentTerm(id: string, data: PaymentTermFormData): Promise<PaymentTerm> {
  const response = await axiosInstance.patch(`/payment-terms/${id}`, data);
  return response.data?.data || response.data;
}

// Warehouses
export async function getWarehouses(): Promise<Warehouse[]> {
  const response = await axiosInstance.get('/warehouses');
  return response.data?.data || response.data;
}

export async function createWarehouse(data: WarehouseFormData): Promise<Warehouse> {
  const response = await axiosInstance.post('/warehouses', data);
  return response.data?.data || response.data;
}

export async function getWarehouse(id: string): Promise<Warehouse> {
  const response = await axiosInstance.get(`/warehouses/${id}`);
  return response.data?.data || response.data;
}

export async function updateWarehouse(id: string, data: WarehouseFormData): Promise<Warehouse> {
  const response = await axiosInstance.patch(`/warehouses/${id}`, data);
  return response.data?.data || response.data;
}

// Items
export async function getItems(): Promise<Item[]> {
  const response = await axiosInstance.get('/items');
  return response.data?.data || response.data;
}

export async function createItem(data: ItemFormData): Promise<Item> {
  const response = await axiosInstance.post('/items', data);
  return response.data?.data || response.data;
}

export async function getItem(id: string): Promise<Item> {
  const response = await axiosInstance.get(`/items/${id}`);
  return response.data?.data || response.data;
}

export async function updateItem(id: string, data: Partial<ItemFormData>): Promise<Item> {
  const response = await axiosInstance.patch(`/items/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteItem(id: string): Promise<void> {
  await axiosInstance.delete(`/items/${id}`);
}

// Vendors
export async function getVendors(): Promise<Vendor[]> {
  const response = await axiosInstance.get('/vendors');
  return response.data?.data || response.data;
}

export async function getVendor(id: string): Promise<Vendor> {
  const response = await axiosInstance.get(`/vendors/${id}`);
  return response.data?.data || response.data;
}

export async function createVendor(data: VendorFormData): Promise<Vendor> {
  const response = await axiosInstance.post('/vendors', data);
  return response.data?.data || response.data;
}

export async function updateVendor(id: string, data: Partial<VendorFormData>): Promise<Vendor> {
  const response = await axiosInstance.patch(`/vendors/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteVendor(id: string): Promise<void> {
  await axiosInstance.delete(`/vendors/${id}`);
}

export async function addVendorContact(id: string, data: VendorContact): Promise<void> {
  await axiosInstance.post(`/vendors/${id}/contacts`, data);
}

export async function addVendorBankDetail(id: string, data: VendorBankDetail): Promise<void> {
  await axiosInstance.post(`/vendors/${id}/bank-details`, data);
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  const response = await axiosInstance.get('/customers');
  return response.data?.data || response.data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const response = await axiosInstance.get(`/customers/${id}`);
  return response.data?.data || response.data;
}

export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  const response = await axiosInstance.post('/customers', data);
  return response.data?.data || response.data;
}

export async function updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<Customer> {
  const response = await axiosInstance.patch(`/customers/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await axiosInstance.delete(`/customers/${id}`);
}

export async function addCustomerContact(id: string, data: CustomerContact): Promise<void> {
  await axiosInstance.post(`/customers/${id}/contacts`, data);
}

// Purchase Orders
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const response = await axiosInstance.get('/purchase-orders');
  return response.data?.data || response.data;
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const response = await axiosInstance.get(`/purchase-orders/${id}`);
  return response.data?.data || response.data;
}

export async function createPurchaseOrder(data: PurchaseOrderFormData): Promise<PurchaseOrder> {
  const response = await axiosInstance.post('/purchase-orders', data);
  return response.data?.data || response.data;
}

export async function updatePurchaseOrder(id: string, data: Partial<PurchaseOrderFormData>): Promise<PurchaseOrder> {
  const response = await axiosInstance.patch(`/purchase-orders/${id}`, data);
  return response.data?.data || response.data;
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  await axiosInstance.delete(`/purchase-orders/${id}`);
}

export async function submitPurchaseOrder(id: string): Promise<void> {
  await axiosInstance.post(`/purchase-orders/${id}/submit`);
}

export async function approvePurchaseOrder(id: string): Promise<void> {
  await axiosInstance.post(`/purchase-orders/${id}/approve`);
}

export async function rejectPurchaseOrder(id: string): Promise<void> {
  await axiosInstance.post(`/purchase-orders/${id}/reject`);
}

export async function cancelPurchaseOrder(id: string): Promise<void> {
  await axiosInstance.post(`/purchase-orders/${id}/cancel`);
}

export async function getPurchaseOrderHistory(id: string): Promise<any> {
  const response = await axiosInstance.post(`/purchase-orders/${id}/history`);
  return response.data?.data || response.data;
}

// GRN (Goods Received Note)
export async function getGRNs(): Promise<GRN[]> {
  const response = await axiosInstance.get('/grn');
  return response.data?.data || response.data;
}

export async function getGRN(id: string): Promise<GRN> {
  const response = await axiosInstance.get(`/grn/${id}`);
  return response.data?.data || response.data;
}

export async function createGRN(data: GRNFormData): Promise<GRN> {
  const response = await axiosInstance.post('/grn', data);
  return response.data?.data || response.data;
}

export async function updateGRN(id: string, data: Partial<GRNFormData>): Promise<GRN> {
  const response = await axiosInstance.patch(`/grn/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteGRN(id: string): Promise<void> {
  await axiosInstance.delete(`/grn/${id}`);
}

export async function confirmGRN(id: string): Promise<void> {
  await axiosInstance.post(`/grn/${id}/confirm`);
}

export async function cancelGRN(id: string): Promise<void> {
  await axiosInstance.post(`/grn/${id}/cancel`);
}

export async function getGRNByPurchaseOrder(purchaseOrderId: string): Promise<GRN[]> {
  const response = await axiosInstance.get(`/purchase-orders/${purchaseOrderId}/grn`);
  return response.data?.data || response.data;
}

// Invoices
export async function getInvoices(): Promise<Invoice[]> {
  const response = await axiosInstance.get('/purchase-invoices');
  return response.data?.data || response.data;
}

export async function getInvoice(id: string): Promise<Invoice> {
  const response = await axiosInstance.get(`/purchase-invoices/${id}`);
  return response.data?.data || response.data;
}

export async function createInvoice(data: InvoiceFormData): Promise<Invoice> {
  const response = await axiosInstance.post('/purchase-invoices', data);
  return response.data?.data || response.data;
}

export async function updateInvoice(id: string, data: Partial<InvoiceFormData>): Promise<Invoice> {
  const response = await axiosInstance.patch(`/purchase-invoices/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  await axiosInstance.delete(`/purchase-invoices/${id}`);
}

export async function getInvoicePDF(id: string): Promise<Blob> {
  const response = await axiosInstance.get(`/purchase-invoices/${id}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function validateInvoice(id: string): Promise<void> {
  await axiosInstance.post(`/purchase-invoices/${id}/validate`);
}

export async function getInvoiceMatchResult(id: string): Promise<any> {
  const response = await axiosInstance.get(`/purchase-invoices/${id}/match-result`);
  return response.data?.data || response.data;
}

export async function postInvoice(id: string): Promise<void> {
  await axiosInstance.post(`/purchase-invoices/${id}/post`);
}

export async function cancelInvoice(id: string): Promise<void> {
  await axiosInstance.post(`/purchase-invoices/${id}/cancel`);
}

// Payments
export async function createPayment(data: PaymentFormData): Promise<Payment> {
  const response = await axiosInstance.post('/purchase-payments', data);
  return response.data?.data || response.data;
}

export async function getPayments(): Promise<Payment[]> {
  const response = await axiosInstance.get('/purchase-payments');
  return response.data?.data || response.data;
}

export async function getPayment(id: string): Promise<Payment> {
  const response = await axiosInstance.get(`/purchase-payments/${id}`);
  return response.data?.data || response.data;
}

export async function updatePayment(id: string, data: Partial<PaymentFormData>): Promise<Payment> {
  const response = await axiosInstance.patch(`/purchase-payments/${id}`, data);
  return response.data?.data || response.data;
}

// Sales Orders
export async function getSalesOrders(): Promise<SalesOrder[]> {
  const response = await axiosInstance.get('/sales-orders');
  return response.data?.data || response.data;
}

export async function getSalesOrder(id: string): Promise<SalesOrder> {
  const response = await axiosInstance.get(`/sales-orders/${id}`);
  return response.data?.data || response.data;
}

export async function createSalesOrder(data: SalesOrderFormData): Promise<SalesOrder> {
  const response = await axiosInstance.post('/sales-orders', data);
  return response.data?.data || response.data;
}

export async function updateSalesOrder(id: string, data: Partial<SalesOrderFormData>): Promise<SalesOrder> {
  const response = await axiosInstance.patch(`/sales-orders/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteSalesOrder(id: string): Promise<void> {
  await axiosInstance.delete(`/sales-orders/${id}`);
}

export async function confirmSalesOrder(id: string): Promise<void> {
  await axiosInstance.post(`/sales-orders/${id}/confirm`);
}

export async function cancelSalesOrder(id: string): Promise<void> {
  await axiosInstance.post(`/sales-orders/${id}/cancel`);
}

// Sales Invoices
export async function getSalesInvoices(): Promise<SalesInvoice[]> {
  const response = await axiosInstance.get('/sales-invoices');
  return response.data?.data || response.data;
}

export async function getSalesInvoice(id: string): Promise<SalesInvoice> {
  const response = await axiosInstance.get(`/sales-invoices/${id}`);
  return response.data?.data || response.data;
}

export async function createSalesInvoice(data: SalesInvoiceFormData): Promise<SalesInvoice> {
  const response = await axiosInstance.post('/sales-invoices', data);
  return response.data?.data || response.data;
}

export async function updateSalesInvoice(id: string, data: Partial<SalesInvoiceFormData>): Promise<SalesInvoice> {
  const response = await axiosInstance.patch(`/sales-invoices/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteSalesInvoice(id: string): Promise<void> {
  await axiosInstance.delete(`/sales-invoices/${id}`);
}

export async function getSalesInvoicePDF(id: string): Promise<Blob> {
  const response = await axiosInstance.get(`/sales-invoices/${id}/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function postSalesInvoice(id: string): Promise<void> {
  await axiosInstance.post(`/sales-invoices/${id}/post`);
}

export async function cancelSalesInvoice(id: string): Promise<void> {
  await axiosInstance.post(`/sales-invoices/${id}/cancel`);
}

// Sales Receipts
export async function getSalesReceipts(): Promise<SalesReceipt[]> {
  const response = await axiosInstance.get('/sales-receipts');
  return response.data?.data || response.data;
}

export async function getSalesReceipt(id: string): Promise<SalesReceipt> {
  const response = await axiosInstance.get(`/sales-receipts/${id}`);
  return response.data?.data || response.data;
}

export async function createSalesReceipt(data: SalesReceiptFormData): Promise<SalesReceipt> {
  const response = await axiosInstance.post('/sales-receipts', data);
  return response.data?.data || response.data;
}

export async function updateSalesReceipt(id: string, data: Partial<SalesReceiptFormData>): Promise<SalesReceipt> {
  const response = await axiosInstance.patch(`/sales-receipts/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteSalesReceipt(id: string): Promise<void> {
  await axiosInstance.delete(`/sales-receipts/${id}`);
}

export async function voidSalesReceipt(id: string): Promise<void> {
  await axiosInstance.post(`/sales-receipts/${id}/void`);
}

export async function getSalesInvoiceReceipts(salesInvoiceId: string): Promise<SalesReceipt[]> {
  const response = await axiosInstance.get(`/sales-invoices/${salesInvoiceId}/receipts`);
  return response.data?.data || response.data;
}

// Reports
export async function getPurchaseRegister(): Promise<PurchaseRegisterItem[]> {
  const response = await axiosInstance.get('/reports/purchase-register');
  return response.data?.data || response.data;
}

export async function getSalesRegister(): Promise<SalesRegisterItem[]> {
  const response = await axiosInstance.get('/reports/sales-register');
  return response.data?.data || response.data;
}
