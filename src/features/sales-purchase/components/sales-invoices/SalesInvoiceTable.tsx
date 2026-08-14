import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Building2, Calendar } from 'lucide-react';
import type { SalesInvoice } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface SalesInvoiceTableProps {
  salesInvoices: SalesInvoice[];
  className?: string;
  onDelete?: (id: string) => void;
}

export default function SalesInvoiceTable({ salesInvoices, className, onDelete }: SalesInvoiceTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Invoice Number</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Customer</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Invoice Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Sales Order</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {salesInvoices.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No sales invoices found. Create your first sales invoice.
              </td>
            </tr>
          ) : (
            salesInvoices.map((salesInvoice) => (
              <tr key={salesInvoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">{salesInvoice.id}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <div className="text-sm text-slate-900">{salesInvoice.customer?.customerName || '-'}</div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {new Date(salesInvoice.invoiceDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  {salesInvoice.salesOrder?.id || '-'}
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    salesInvoice.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                    salesInvoice.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                    salesInvoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-slate-100 text-slate-800'
                  )}>
                    {salesInvoice.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/sales-invoices/${salesInvoice.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/sales-invoices/${salesInvoice.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" 
                      title="Delete"
                      onClick={() => onDelete?.(salesInvoice.id)}
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
