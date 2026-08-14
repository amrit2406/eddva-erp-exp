import { Link } from 'react-router-dom';
import { Eye, Edit, CreditCard, Calendar, IndianRupee, ArrowUp, ArrowDown } from 'lucide-react';
import type { Payment } from '../../types/sales-purchase.types';
import { cn } from '../../../../utils/cn';

interface PaymentTableProps {
  payments: Payment[];
  className?: string;
}

export default function PaymentTable({ payments, className }: PaymentTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Payment Number</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden md:table-cell">Invoice</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 hidden lg:table-cell">Payment Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No payments found. Create your first payment.
              </td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    <div className="font-medium text-slate-900">PAY-{payment.id.slice(0, 8)}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    payment.paymentType === 'RECEIVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {payment.paymentType === 'RECEIVED' ? (
                      <><ArrowUp className="h-3 w-3 mr-1" /> Received</>
                    ) : (
                      <><ArrowDown className="h-3 w-3 mr-1" /> Paid</>
                    )}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell">
                  INV-{payment.invoiceId?.slice(0, 8) || '-'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600 hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-900">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="h-3 w-3 text-slate-400" />
                    {Number(payment.amount).toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    payment.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  )}>
                    {payment.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sales-purchase/payments/${payment.id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/sales-purchase/payments/${payment.id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
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
