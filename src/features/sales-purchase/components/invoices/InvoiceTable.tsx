import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, FileText, Calendar, Building2, IndianRupee } from 'lucide-react';
import type { Invoice } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface InvoiceTableProps {
  invoices: Invoice[];
  className?: string;
  onDelete?: (id: string) => void;
}

export default function InvoiceTable({ invoices, className, onDelete }: InvoiceTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Invoice Number</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Party</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Invoice Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No invoices found. Create your first invoice.
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-900">INV-{invoice.id.slice(0, 8)}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    invoice.invoiceType === 'SALES' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  )}>
                    {invoice.invoiceType}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    {invoice.invoiceType === 'SALES' ? invoice.customer?.customerName : invoice.vendor?.vendorName || '-'}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-900">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3 text-slate-400" />
                    {invoice.items ? invoice.items.reduce((sum, item) => sum + (item.quantity * (Number(item.unitPrice) || 0)), 0).toFixed(2) : '0.00'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    invoice.status === 'DRAFT' ? 'bg-slate-100 text-slate-800' :
                    invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  )}>
                    {invoice.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/invoices/${invoice.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/invoices/${invoice.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" 
                      title="Delete"
                      onClick={() => onDelete?.(invoice.id)}
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
