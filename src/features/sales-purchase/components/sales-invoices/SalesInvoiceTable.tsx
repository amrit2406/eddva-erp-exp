import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Building2, Calendar } from 'lucide-react';
import type { SalesInvoice } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface SalesInvoiceTableProps {
  salesInvoices: SalesInvoice[];
  className?: string;
  onDelete?: (id: number) => void;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'POSTED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

function paymentStatusBadgeClass(status: string): string {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'PARTIAL':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export default function SalesInvoiceTable({ salesInvoices, className, onDelete }: SalesInvoiceTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Invoice Number</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Customer</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Invoice Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Sales Order</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Payment</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {salesInvoices.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No sales invoices found. Create your first sales invoice.
              </td>
            </tr>
          ) : (
            salesInvoices.map((salesInvoice) => (
              <tr key={salesInvoice.si_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">{salesInvoice.invoice_number}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <div className="text-sm text-slate-900">{salesInvoice.customer?.customer_name || '-'}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {salesInvoice.invoice_date ? new Date(salesInvoice.invoice_date).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  {salesInvoice.sales_order?.so_number || '-'}
                </td>
                <td className="py-3 px-4">
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusBadgeClass(salesInvoice.status))}>
                    {salesInvoice.status}
                  </span>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', paymentStatusBadgeClass(salesInvoice.payment_status))}>
                    {salesInvoice.payment_status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/sales-invoices/${salesInvoice.si_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/sales-invoices/${salesInvoice.si_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(salesInvoice.si_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
