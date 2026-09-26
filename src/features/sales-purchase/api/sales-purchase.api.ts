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
  VendorContactFormData,
  VendorBankDetail,
  VendorBankDetailFormData,
  Customer,
  CustomerFormData,
  CustomerContact,
  CustomerContactFormData,
  PurchaseOrder,
  PurchaseOrderFormData,
  ApprovalRule,
  ApprovalRuleFormData,
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
  SalesReceipt,
  SalesReceiptFormData,
  PurchaseRegisterItem,
  SalesRegisterItem,
  RegisterResponse,
  DashboardSummary,
} from '../types/sales-purchase.types';

// Item Categories
export async function getItemCategories(): Promise<ItemCategory[]> {
  const response = await axiosInstance.get('/sales-purchase/item-categories');
  return response.data?.data || response.data;
}

export async function getItemCategory(id: string | number): Promise<ItemCategory> {
  const response = await axiosInstance.get(`/sales-purchase/item-categories/${id}`);
  return response.data?.data || response.data;
}

export async function createItemCategory(data: ItemCategoryFormData): Promise<ItemCategory> {
  const response = await axiosInstance.post('/sales-purchase/item-categories', data);
  return response.data?.data || response.data;
}

export async function updateItemCategory(id: string | number, data: Partial<ItemCategoryFormData>): Promise<ItemCategory> {
  const response = await axiosInstance.patch(`/sales-purchase/item-categories/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteItemCategory(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/item-categories/${id}`);
}

// UOM
export async function getUOMs(): Promise<UOM[]> {
  const response = await axiosInstance.get('/sales-purchase/uoms');
  return response.data?.data || response.data;
}

export async function createUOM(data: UOMFormData): Promise<UOM> {
  const response = await axiosInstance.post('/sales-purchase/uoms', data);
  return response.data?.data || response.data;
}

export async function getUOM(id: string | number): Promise<UOM> {
  const response = await axiosInstance.get(`/sales-purchase/uoms/${id}`);
  return response.data?.data || response.data;
}

export async function updateUOM(id: string | number, data: Partial<UOMFormData>): Promise<UOM> {
  const response = await axiosInstance.patch(`/sales-purchase/uoms/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteUOM(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/uoms/${id}`);
}

// Tax Codes
export async function getTaxCodes(): Promise<TaxCode[]> {
  const response = await axiosInstance.get('/sales-purchase/tax-codes');
  return response.data?.data || response.data;
}

export async function createTaxCode(data: TaxCodeFormData): Promise<TaxCode> {
  const response = await axiosInstance.post('/sales-purchase/tax-codes', data);
  return response.data?.data || response.data;
}

export async function getTaxCode(id: string | number): Promise<TaxCode> {
  const response = await axiosInstance.get(`/sales-purchase/tax-codes/${id}`);
  return response.data?.data || response.data;
}

export async function deleteTaxCode(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/tax-codes/${id}`);
}

export async function setTaxCodeActive(id: string | number, isActive: boolean): Promise<TaxCode> {
  const response = await axiosInstance.patch(`/sales-purchase/tax-codes/${id}/active`, { is_active: isActive });
  return response.data?.data || response.data;
}

// Payment Terms
export async function getPaymentTerms(): Promise<PaymentTerm[]> {
  const response = await axiosInstance.get('/sales-purchase/payment-terms');
  return response.data?.data || response.data;
}

export async function createPaymentTerm(data: PaymentTermFormData): Promise<PaymentTerm> {
  const response = await axiosInstance.post('/sales-purchase/payment-terms', data);
  return response.data?.data || response.data;
}

export async function getPaymentTerm(id: string | number): Promise<PaymentTerm> {
  const response = await axiosInstance.get(`/sales-purchase/payment-terms/${id}`);
  return response.data?.data || response.data;
}

export async function updatePaymentTerm(id: string | number, data: Partial<PaymentTermFormData>): Promise<PaymentTerm> {
  const response = await axiosInstance.patch(`/sales-purchase/payment-terms/${id}`, data);
  return response.data?.data || response.data;
}

export async function deletePaymentTerm(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/payment-terms/${id}`);
}

// Warehouses
export async function getWarehouses(): Promise<Warehouse[]> {
  const response = await axiosInstance.get('/sales-purchase/warehouses');
  return response.data?.data || response.data;
}

export async function createWarehouse(data: WarehouseFormData): Promise<Warehouse> {
  const response = await axiosInstance.post('/sales-purchase/warehouses', data);
  return response.data?.data || response.data;
}

export async function getWarehouse(id: string | number): Promise<Warehouse> {
  const response = await axiosInstance.get(`/sales-purchase/warehouses/${id}`);
  return response.data?.data || response.data;
}

export async function updateWarehouse(id: string | number, data: Partial<WarehouseFormData>): Promise<Warehouse> {
  const response = await axiosInstance.patch(`/sales-purchase/warehouses/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteWarehouse(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/warehouses/${id}`);
}

// Items
export async function getItems(): Promise<Item[]> {
  const response = await axiosInstance.get('/sales-purchase/items');
  return response.data?.data || response.data;
}

export async function createItem(data: ItemFormData): Promise<Item> {
  const response = await axiosInstance.post('/sales-purchase/items', data);
  return response.data?.data || response.data;
}

export async function getItem(id: string | number): Promise<Item> {
  const response = await axiosInstance.get(`/sales-purchase/items/${id}`);
  return response.data?.data || response.data;
}

export async function updateItem(id: string | number, data: Partial<ItemFormData>): Promise<Item> {
  const response = await axiosInstance.patch(`/sales-purchase/items/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteItem(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/items/${id}`);
}

// Vendors
export async function getVendors(): Promise<Vendor[]> {
  const response = await axiosInstance.get('/sales-purchase/vendors');
  return response.data?.data || response.data;
}

export async function getVendor(id: string | number): Promise<Vendor> {
  const response = await axiosInstance.get(`/sales-purchase/vendors/${id}`);
  return response.data?.data || response.data;
}

export async function createVendor(data: VendorFormData): Promise<Vendor> {
  const response = await axiosInstance.post('/sales-purchase/vendors', data);
  return response.data?.data || response.data;
}

export async function updateVendor(id: string | number, data: Partial<VendorFormData>): Promise<Vendor> {
  const response = await axiosInstance.patch(`/sales-purchase/vendors/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteVendor(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/vendors/${id}`);
}

export async function getVendorContacts(vendorId: string | number): Promise<VendorContact[]> {
  const response = await axiosInstance.get(`/sales-purchase/vendors/${vendorId}/contacts`);
  return response.data?.data || response.data;
}

export async function addVendorContact(vendorId: string | number, data: VendorContactFormData): Promise<VendorContact> {
  const response = await axiosInstance.post(`/sales-purchase/vendors/${vendorId}/contacts`, data);
  return response.data?.data || response.data;
}

export async function updateVendorContact(
  vendorId: string | number,
  contactId: string | number,
  data: Partial<VendorContactFormData>
): Promise<VendorContact> {
  const response = await axiosInstance.patch(`/sales-purchase/vendors/${vendorId}/contacts/${contactId}`, data);
  return response.data?.data || response.data;
}

export async function deleteVendorContact(vendorId: string | number, contactId: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/vendors/${vendorId}/contacts/${contactId}`);
}

export async function getVendorBankDetails(vendorId: string | number): Promise<VendorBankDetail[]> {
  const response = await axiosInstance.get(`/sales-purchase/vendors/${vendorId}/bank-details`);
  return response.data?.data || response.data;
}

export async function addVendorBankDetail(vendorId: string | number, data: VendorBankDetailFormData): Promise<VendorBankDetail> {
  const response = await axiosInstance.post(`/sales-purchase/vendors/${vendorId}/bank-details`, data);
  return response.data?.data || response.data;
}

export async function updateVendorBankDetail(
  vendorId: string | number,
  bankId: string | number,
  data: Partial<VendorBankDetailFormData>
): Promise<VendorBankDetail> {
  const response = await axiosInstance.patch(`/sales-purchase/vendors/${vendorId}/bank-details/${bankId}`, data);
  return response.data?.data || response.data;
}

export async function deleteVendorBankDetail(vendorId: string | number, bankId: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/vendors/${vendorId}/bank-details/${bankId}`);
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  const response = await axiosInstance.get('/sales-purchase/customers');
  return response.data?.data || response.data;
}

export async function getCustomer(id: string | number): Promise<Customer> {
  const response = await axiosInstance.get(`/sales-purchase/customers/${id}`);
  return response.data?.data || response.data;
}

export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  const response = await axiosInstance.post('/sales-purchase/customers', data);
  return response.data?.data || response.data;
}

export async function updateCustomer(id: string | number, data: Partial<CustomerFormData>): Promise<Customer> {
  const response = await axiosInstance.patch(`/sales-purchase/customers/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteCustomer(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/customers/${id}`);
}

export async function getCustomerContacts(customerId: string | number): Promise<CustomerContact[]> {
  const response = await axiosInstance.get(`/sales-purchase/customers/${customerId}/contacts`);
  return response.data?.data || response.data;
}

export async function addCustomerContact(customerId: string | number, data: CustomerContactFormData): Promise<CustomerContact> {
  const response = await axiosInstance.post(`/sales-purchase/customers/${customerId}/contacts`, data);
  return response.data?.data || response.data;
}

export async function updateCustomerContact(
  customerId: string | number,
  contactId: string | number,
  data: Partial<CustomerContactFormData>
): Promise<CustomerContact> {
  const response = await axiosInstance.patch(`/sales-purchase/customers/${customerId}/contacts/${contactId}`, data);
  return response.data?.data || response.data;
}

export async function deleteCustomerContact(customerId: string | number, contactId: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/customers/${customerId}/contacts/${contactId}`);
}

// Purchase Orders
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const response = await axiosInstance.get('/sales-purchase/purchase-orders');
  return response.data?.data || response.data;
}

export async function getPurchaseOrder(id: string | number): Promise<PurchaseOrder> {
  const response = await axiosInstance.get(`/sales-purchase/purchase-orders/${id}`);
  return response.data?.data || response.data;
}

export async function createPurchaseOrder(data: PurchaseOrderFormData): Promise<PurchaseOrder> {
  const response = await axiosInstance.post('/sales-purchase/purchase-orders', data);
  return response.data?.data || response.data;
}

export async function updatePurchaseOrder(id: string | number, data: Partial<PurchaseOrderFormData>): Promise<PurchaseOrder> {
  const response = await axiosInstance.patch(`/sales-purchase/purchase-orders/${id}`, data);
  return response.data?.data || response.data;
}

export async function deletePurchaseOrder(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/purchase-orders/${id}`);
}

export async function submitPurchaseOrder(id: string | number): Promise<PurchaseOrder> {
  const response = await axiosInstance.post(`/sales-purchase/purchase-orders/${id}/submit`);
  return response.data?.data || response.data;
}

export async function approvePurchaseOrder(id: string | number): Promise<PurchaseOrder> {
  const response = await axiosInstance.post(`/sales-purchase/purchase-orders/${id}/approve`);
  return response.data?.data || response.data;
}

export async function rejectPurchaseOrder(id: string | number, rejectionReason?: string): Promise<PurchaseOrder> {
  const response = await axiosInstance.post(`/sales-purchase/purchase-orders/${id}/reject`, {
    rejection_reason: rejectionReason,
  });
  return response.data?.data || response.data;
}

export async function cancelPurchaseOrder(id: string | number): Promise<PurchaseOrder> {
  const response = await axiosInstance.post(`/sales-purchase/purchase-orders/${id}/cancel`);
  return response.data?.data || response.data;
}

export async function getPurchaseOrderHistory(id: string | number): Promise<any> {
  const response = await axiosInstance.post(`/sales-purchase/purchase-orders/${id}/history`);
  return response.data?.data || response.data;
}

// PO Approval Rules
export async function getApprovalRules(): Promise<ApprovalRule[]> {
  const response = await axiosInstance.get('/sales-purchase/approval-rules');
  return response.data?.data || response.data;
}

export async function getApprovalRule(id: string | number): Promise<ApprovalRule> {
  const response = await axiosInstance.get(`/sales-purchase/approval-rules/${id}`);
  return response.data?.data || response.data;
}

export async function createApprovalRule(data: ApprovalRuleFormData): Promise<ApprovalRule> {
  const response = await axiosInstance.post('/sales-purchase/approval-rules', data);
  return response.data?.data || response.data;
}

export async function updateApprovalRule(id: string | number, data: Partial<ApprovalRuleFormData>): Promise<ApprovalRule> {
  const response = await axiosInstance.patch(`/sales-purchase/approval-rules/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteApprovalRule(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/approval-rules/${id}`);
}

// GRN (Goods Received Note)
export async function getGRNs(): Promise<GRN[]> {
  const response = await axiosInstance.get('/sales-purchase/grns');
  return response.data?.data || response.data;
}

export async function getGRN(id: string | number): Promise<GRN> {
  const response = await axiosInstance.get(`/sales-purchase/grns/${id}`);
  return response.data?.data || response.data;
}

export async function createGRN(data: GRNFormData): Promise<GRN> {
  const response = await axiosInstance.post('/sales-purchase/grns', data);
  return response.data?.data || response.data;
}

export async function updateGRN(id: string | number, data: Partial<GRNFormData>): Promise<GRN> {
  const response = await axiosInstance.patch(`/sales-purchase/grns/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteGRN(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/grns/${id}`);
}

export async function postGRN(id: string | number): Promise<GRN> {
  const response = await axiosInstance.post(`/sales-purchase/grns/${id}/post`);
  return response.data?.data || response.data;
}

export async function cancelGRN(id: string | number): Promise<GRN> {
  const response = await axiosInstance.post(`/sales-purchase/grns/${id}/cancel`);
  return response.data?.data || response.data;
}

export async function getGRNByPurchaseOrder(purchaseOrderId: string): Promise<GRN[]> {
  const response = await axiosInstance.get(`/purchase-orders/${purchaseOrderId}/grn`);
  return response.data?.data || response.data;
}

// Invoices
export async function getInvoices(): Promise<Invoice[]> {
  const response = await axiosInstance.get('/sales-purchase/purchase-invoices');
  return response.data?.data || response.data;
}

export async function getInvoice(id: string | number): Promise<Invoice> {
  const response = await axiosInstance.get(`/sales-purchase/purchase-invoices/${id}`);
  return response.data?.data || response.data;
}

export async function createInvoice(data: InvoiceFormData): Promise<Invoice> {
  const response = await axiosInstance.post('/sales-purchase/purchase-invoices', data);
  return response.data?.data || response.data;
}

export async function updateInvoice(id: string | number, data: Partial<InvoiceFormData>): Promise<Invoice> {
  const response = await axiosInstance.patch(`/sales-purchase/purchase-invoices/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteInvoice(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/purchase-invoices/${id}`);
}

export async function postInvoice(id: string | number): Promise<Invoice> {
  const response = await axiosInstance.post(`/sales-purchase/purchase-invoices/${id}/post`);
  return response.data?.data || response.data;
}

export async function cancelInvoice(id: string | number): Promise<Invoice> {
  const response = await axiosInstance.post(`/sales-purchase/purchase-invoices/${id}/cancel`);
  return response.data?.data || response.data;
}

// Payments
export async function createPayment(data: PaymentFormData): Promise<Payment> {
  const response = await axiosInstance.post('/sales-purchase/purchase-payments', data);
  return response.data?.data || response.data;
}

export async function getPayments(): Promise<Payment[]> {
  const response = await axiosInstance.get('/sales-purchase/purchase-payments');
  return response.data?.data || response.data;
}

export async function getPayment(id: string | number): Promise<Payment> {
  const response = await axiosInstance.get(`/sales-purchase/purchase-payments/${id}`);
  return response.data?.data || response.data;
}

export async function updatePayment(id: string | number, data: Partial<PaymentFormData>): Promise<Payment> {
  const response = await axiosInstance.patch(`/sales-purchase/purchase-payments/${id}`, data);
  return response.data?.data || response.data;
}

export async function deletePayment(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/purchase-payments/${id}`);
}

// Sales Orders
export async function getSalesOrders(): Promise<SalesOrder[]> {
  const response = await axiosInstance.get('/sales-purchase/sales-orders');
  return response.data?.data || response.data;
}

export async function getSalesOrder(id: string | number): Promise<SalesOrder> {
  const response = await axiosInstance.get(`/sales-purchase/sales-orders/${id}`);
  return response.data?.data || response.data;
}

export async function createSalesOrder(data: SalesOrderFormData): Promise<SalesOrder> {
  const response = await axiosInstance.post('/sales-purchase/sales-orders', data);
  return response.data?.data || response.data;
}

export async function updateSalesOrder(id: string | number, data: Partial<SalesOrderFormData>): Promise<SalesOrder> {
  const response = await axiosInstance.patch(`/sales-purchase/sales-orders/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteSalesOrder(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/sales-orders/${id}`);
}

export async function confirmSalesOrder(id: string | number): Promise<SalesOrder> {
  const response = await axiosInstance.post(`/sales-purchase/sales-orders/${id}/confirm`);
  return response.data?.data || response.data;
}

export async function cancelSalesOrder(id: string | number): Promise<SalesOrder> {
  const response = await axiosInstance.post(`/sales-purchase/sales-orders/${id}/cancel`);
  return response.data?.data || response.data;
}

// Sales Invoices
export async function getSalesInvoices(): Promise<SalesInvoice[]> {
  const response = await axiosInstance.get('/sales-purchase/sales-invoices');
  return response.data?.data || response.data;
}

export async function getSalesInvoice(id: string | number): Promise<SalesInvoice> {
  const response = await axiosInstance.get(`/sales-purchase/sales-invoices/${id}`);
  return response.data?.data || response.data;
}

export async function createSalesInvoice(data: SalesInvoiceFormData): Promise<SalesInvoice> {
  const response = await axiosInstance.post('/sales-purchase/sales-invoices', data);
  return response.data?.data || response.data;
}

export async function updateSalesInvoice(id: string | number, data: Partial<SalesInvoiceFormData>): Promise<SalesInvoice> {
  const response = await axiosInstance.patch(`/sales-purchase/sales-invoices/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteSalesInvoice(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/sales-invoices/${id}`);
}

export async function postSalesInvoice(id: string | number): Promise<SalesInvoice> {
  const response = await axiosInstance.post(`/sales-purchase/sales-invoices/${id}/post`);
  return response.data?.data || response.data;
}

export async function cancelSalesInvoice(id: string | number): Promise<SalesInvoice> {
  const response = await axiosInstance.post(`/sales-purchase/sales-invoices/${id}/cancel`);
  return response.data?.data || response.data;
}

// Sales Receipts
export async function getSalesReceipts(): Promise<SalesReceipt[]> {
  const response = await axiosInstance.get('/sales-purchase/sales-receipts');
  return response.data?.data || response.data;
}

export async function getSalesReceipt(id: string | number): Promise<SalesReceipt> {
  const response = await axiosInstance.get(`/sales-purchase/sales-receipts/${id}`);
  return response.data?.data || response.data;
}

export async function createSalesReceipt(data: SalesReceiptFormData): Promise<SalesReceipt> {
  const response = await axiosInstance.post('/sales-purchase/sales-receipts', data);
  return response.data?.data || response.data;
}

export async function updateSalesReceipt(id: string | number, data: Partial<SalesReceiptFormData>): Promise<SalesReceipt> {
  const response = await axiosInstance.patch(`/sales-purchase/sales-receipts/${id}`, data);
  return response.data?.data || response.data;
}

export async function deleteSalesReceipt(id: string | number): Promise<void> {
  await axiosInstance.delete(`/sales-purchase/sales-receipts/${id}`);
}

// Reports
export async function getPurchaseRegister(params?: { page?: number; limit?: number }): Promise<RegisterResponse<PurchaseRegisterItem>> {
  const response = await axiosInstance.get('/sales-purchase/reports/purchase-register', { params });
  return response.data;
}

export async function getSalesRegister(params?: { page?: number; limit?: number }): Promise<RegisterResponse<SalesRegisterItem>> {
  const response = await axiosInstance.get('/sales-purchase/reports/sales-register', { params });
  return response.data;
}

// The register endpoints page at most 200 lines; fetch every page so totals,
// search and export cover all lines.
const REGISTER_PAGE = 200;
async function fetchAllPages<T>(fetchPage: (params: { page: number; limit: number }) => Promise<RegisterResponse<T>>): Promise<RegisterResponse<T>> {
  const first = await fetchPage({ page: 1, limit: REGISTER_PAGE });
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, (first.pagination?.totalPages ?? 1) - 1) }, (_, i) => fetchPage({ page: i + 2, limit: REGISTER_PAGE })),
  );
  return { ...first, data: [...first.data, ...rest.flatMap((r) => r.data)] };
}

export const getFullPurchaseRegister = () => fetchAllPages(getPurchaseRegister);
export const getFullSalesRegister = () => fetchAllPages(getSalesRegister);

// Dashboard
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await axiosInstance.get('/sales-purchase/dashboard/summary');
  return response.data?.data || response.data;
}

// RBAC APIs moved to ./roles.api.ts
