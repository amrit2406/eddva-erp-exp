// Sales Order and Related Types

export type SalesOrderStatus = 
  | 'draft' 
  | 'confirmed' 
  | 'partially_delivered' 
  | 'delivered' 
  | 'cancelled';

export type SalesInvoiceStatus = 'draft' | 'posted' | 'cancelled';
export type SalesPaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface SalesOrder {
  soId: string;
  soNumber: string;
  customerId: string;
  customerName?: string;
  soDate: string;
  deliveryDate?: string;
  status: SalesOrderStatus;
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderItem {
  soItemId: string;
  soId: string;
  itemId: string;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  taxCodeId?: string;
  taxCodeName?: string;
  lineTotal: number;
  invoicedQty: number;
}

export interface SalesOrderWithItems extends SalesOrder {
  items: SalesOrderItem[];
}

export interface SalesInvoice {
  salesInvoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string;
  soId?: string;
  soNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  paymentStatus: SalesPaymentStatus;
  status: SalesInvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SalesInvoiceItem {
  lineId: string;
  salesInvoiceId: string;
  itemId: string;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  lineTotal: number;
}

export interface SalesReceipt {
  receiptId: string;
  salesInvoiceId: string;
  receiptDate: string;
  amount: number;
  mode: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'other';
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface SalesOrderFormData {
  customerId: string;
  soDate: string;
  deliveryDate?: string;
  items: Omit<SalesOrderItem, 'soItemId' | 'soId' | 'invoicedQty'>[];
}

export interface SalesInvoiceFormData {
  customerId: string;
  soId?: string;
  invoiceDate: string;
  dueDate?: string;
  items: Omit<SalesInvoiceItem, 'lineId' | 'salesInvoiceId'>[];
}
