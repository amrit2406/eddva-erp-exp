import { Link } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import type { Voucher } from '../../types/voucher.types';
import { cn } from '../../../../utils/cn';

interface VoucherTableProps {
  vouchers: Voucher[];
  className?: string;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  POSTED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

function displayStatus(voucher: Voucher): string {
  return voucher.cancelledAt ? 'CANCELLED' : voucher.status;
}

export default function VoucherTable({ vouchers, className }: VoucherTableProps) {
  const vouchersArray = Array.isArray(vouchers) ? vouchers : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Voucher</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Reference</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {vouchersArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No vouchers found. Add your first voucher.
              </td>
            </tr>
          ) : (
            vouchersArray.map((voucher) => (
              <tr key={voucher.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link
                    to={`/accounts/vouchers/${voucher.id}`}
                    className="flex items-center gap-2 font-medium text-slate-900 hover:text-[#008BE9]"
                  >
                    <Receipt className="h-4 w-4 text-slate-400" />
                    {voucher.voucherNumber}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{voucher.voucherType?.code ?? '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {new Date(voucher.voucherDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{voucher.referenceNo || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                  ₹{Number(voucher.totalDebit).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      statusColors[displayStatus(voucher)] ?? 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {displayStatus(voucher)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
