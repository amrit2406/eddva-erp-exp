import { Link } from 'react-router-dom';
import { Calendar, Lock, LockOpen } from 'lucide-react';
import type { FinancialYear } from '../../types/financialYear.types';
import { cn } from '../../../../utils/cn';

interface FinancialYearTableProps {
  financialYears: FinancialYear[];
  className?: string;
  onClose?: (id: string, fyLabel: string) => void;
}

export default function FinancialYearTable({ financialYears, className, onClose }: FinancialYearTableProps) {
  const yearsArray = Array.isArray(financialYears) ? financialYears : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">FY Label</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Start Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">End Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {yearsArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No financial years found. Add your first financial year.
              </td>
            </tr>
          ) : (
            yearsArray.map((fy) => (
              <tr key={fy.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link
                    to={`/accounts/financial-years/${fy.id}`}
                    className="flex items-center gap-2 font-medium text-slate-900 hover:text-[#008BE9]"
                  >
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {fy.fyLabel}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {new Date(fy.startDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{new Date(fy.endDate).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      fy.isClosed ? 'bg-slate-100 text-slate-600' : 'bg-green-100 text-green-700'
                    )}
                  >
                    {fy.isClosed ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
                    {fy.isClosed ? 'Closed' : 'Open'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {!fy.isClosed && onClose && (
                    <button
                      onClick={() => onClose(fy.id, fy.fyLabel)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Close Year
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
