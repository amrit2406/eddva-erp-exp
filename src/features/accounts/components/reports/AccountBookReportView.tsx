import type { AccountBookReport } from '../../types/report.types';
import { cn } from '../../../../utils/cn';

interface AccountBookReportViewProps {
  report: AccountBookReport;
  className?: string;
}

export default function AccountBookReportView({ report, className }: AccountBookReportViewProps) {
  const totalDebit = report.entries.reduce((sum, e) => sum + (Number(e.debit) || 0), 0);
  const totalCredit = report.entries.reduce((sum, e) => sum + (Number(e.credit) || 0), 0);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="text-slate-600">
          {report.accounts.map((a) => a.accountName).join(', ') || '—'}
        </div>
        <div className="flex items-center gap-6">
          <span className="text-slate-600">
            Opening: <span className="font-medium text-slate-900">₹{Number(report.openingBalance.amount).toFixed(2)} {report.openingBalance.type}</span>
          </span>
          <span className="text-slate-600">
            Closing: <span className="font-medium text-slate-900">₹{Number(report.closingBalance.amount).toFixed(2)} {report.closingBalance.type}</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Date</th>
              <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Voucher</th>
              <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Account</th>
              <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Narration</th>
              <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Debit</th>
              <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Credit</th>
              <th className="text-right py-2 px-4 text-sm font-semibold text-slate-700">Balance</th>
            </tr>
          </thead>
          <tbody>
            {report.entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No entries found for this date range.
                </td>
              </tr>
            ) : (
              report.entries.map((entry, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 px-4 text-sm text-slate-600">{new Date(entry.voucherDate).toLocaleDateString()}</td>
                  <td className="py-2 px-4 text-sm text-slate-900">{entry.voucherNumber}</td>
                  <td className="py-2 px-4 text-sm text-slate-600">{entry.account ?? entry.voucherType ?? '—'}</td>
                  <td className="py-2 px-4 text-sm text-slate-600">{entry.narration || '—'}</td>
                  <td className="py-2 px-4 text-sm text-slate-900 text-right">
                    {entry.debit ? `₹${Number(entry.debit).toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 px-4 text-sm text-slate-900 text-right">
                    {entry.credit ? `₹${Number(entry.credit).toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 px-4 text-sm text-slate-900 text-right">
                    ₹{Number(entry.runningBalance).toFixed(2)} {entry.runningBalanceType}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {report.entries.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-semibold">
                <td colSpan={4} className="py-2 px-4 text-sm text-slate-700 text-right">
                  Total
                </td>
                <td className="py-2 px-4 text-sm text-slate-900 text-right">₹{totalDebit.toFixed(2)}</td>
                <td className="py-2 px-4 text-sm text-slate-900 text-right">₹{totalCredit.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
