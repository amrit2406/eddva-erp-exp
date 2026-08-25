import { DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Fine } from '../../types/library.types';
import { cn } from '../../../../utils/cn';

interface FineTableProps {
  fines: Fine[];
  className?: string;
  onWaive?: (fine: Fine) => void;
  onPay?: (fine: Fine) => void;
}

export default function FineTable({ fines, className, onWaive, onPay }: FineTableProps) {
  const finesArray = Array.isArray(fines) ? fines : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Reason</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Paid</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {finesArray.length === 0 ? (
            <tr key="no-fines">
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No fines found.
              </td>
            </tr>
          ) : (
            finesArray.map((fine) => (
              <tr key={fine.fine_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="text-sm text-slate-900">{fine.reason}</div>
                  <div className="text-xs text-slate-500">{new Date(fine.created_at).toLocaleDateString()}</div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {fine.amount.toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {fine.amount_paid.toFixed(2)}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {fine.waived ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      <XCircle className="h-3 w-3" />
                      Waived
                    </span>
                  ) : fine.paid ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <Clock className="h-3 w-3" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {!fine.paid && !fine.waived && (
                      <>
                        <button
                          onClick={() => onPay?.(fine)}
                          className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          title="Pay Fine"
                        >
                          Pay
                        </button>
                        <button
                          onClick={() => onWaive?.(fine)}
                          className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                          title="Waive Fine"
                        >
                          Waive
                        </button>
                      </>
                    )}
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
