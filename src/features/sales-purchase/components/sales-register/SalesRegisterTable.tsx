import { Link } from 'react-router-dom';
import { Eye, Download, Calendar, DollarSign } from 'lucide-react';
import { mockSalesInvoices } from '../../mock/sales.mock';
import { SALES_PAYMENT_STATUS_COLORS } from '../../constants/sales.constants';
import { cn } from '../../../../utils/cn';

interface SalesRegisterTableProps {
  className?: string;
}

export default function SalesRegisterTable({ className }: SalesRegisterTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[1100px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Invoice #</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Customer</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Invoice Date</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Due Date</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Taxable</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Tax</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Total</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Payment Status</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockSalesInvoices.map((invoice) => (
            <tr key={invoice.salesInvoiceId} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 sm:px-4">
                <div className="font-medium text-slate-900 text-xs sm:text-sm font-mono">{invoice.invoiceNumber}</div>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div className="font-medium text-slate-900 text-xs sm:text-sm">{invoice.customerName}</div>
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                {invoice.subtotal.toLocaleString()}
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">
                {invoice.taxAmount.toLocaleString()}
              </td>
              <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 font-medium">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{invoice.grandTotal.toLocaleString()}</span>
                </div>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', SALES_PAYMENT_STATUS_COLORS[invoice.paymentStatus])}>
                  {invoice.paymentStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </td>
              <td className="py-3 px-2 sm:px-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link to={`/sales-purchase/sales-register/${invoice.salesInvoiceId}`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Download">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
