// Purchase Order and Related Types

export type PurchaseOrderStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'rejected' 
  | 'partially_received' 
  | 'closed' 
  | 'cancelled';

export type GRNStatus = 'pending' | 'received' | 'verified' | 'cancelled';

export type PurchaseInvoiceStatus = 'draft' | 'posted' | 'cancelled';
export type PurchasePaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface PurchaseOrder {
  poId: string;
  poNumber: string;
  vendorId: string;
  vendorName?: string;
  poDate: string;
  expectedDeliveryDate?: string;
  warehouseId?: string;
  warehouseName?: string;
  status: PurchaseOrderStatus;
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  createdBy?: string;
  createdByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  poItemId: string;
  poId: string;
  itemId: string;
  itemCode?: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  taxCodeId?: string;
  taxCodeName?: string;
  lineTotal: number;
  receivedQty: number;
}

export interface PurchaseOrderWithItems extends PurchaseOrder {
  items: PurchaseOrderItem[];
}

export interface GoodsReceiptNote {
  grnId: string;
  grnNumber: string;
  poId: string;
  poNumber?: string;
  vendorId: string;
  vendorName?: string;
  receivedDate: string;
  warehouseId?: string;
  warehouseName?: string;
  status: GRNStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GRNItem {
  grnItemId: string;
  grnId: string;
  poItemId: string;
  itemId: string;
  itemCode?: string;
  itemName?: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rejectionReason?: string;
}

export interface PurchaseInvoice {
  purchaseInvoiceId: string;
  invoiceNumber: string;
  vendorInvoiceNumber: string;
  vendorId: string;
  vendorName?: string;
  poId?: string;
  poNumber?: string;
  grnId?: string;
  grnNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  subtotal: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  paymentStatus: PurchasePaymentStatus;
  status: PurchaseInvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseInvoiceItem {
  lineId: string;
  purchaseInvoiceId: string;
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

export interface PurchasePayment {
  paymentId: string;
  purchaseInvoiceId: string;
  paymentDate: string;
  amount: number;
  mode: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'other';
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrderFormData {
  vendorId: string;
  poDate: string;
  expectedDeliveryDate?: string;
  warehouseId?: string;
  items: Omit<PurchaseOrderItem, 'poItemId' | 'poId' | 'receivedQty'>[];
}

export interface PurchaseInvoiceFormData {
  vendorId: string;
  vendorInvoiceNumber: string;
  poId?: string;
  grnId?: string;
  invoiceDate: string;
  dueDate?: string;
  items: Omit<PurchaseInvoiceItem, 'lineId' | 'purchaseInvoiceId'>[];
}
