import { Link } from 'react-router-dom';
import { Eye, LogOut, User, Building2 } from 'lucide-react';
import type { VisitorLogSummary } from '../../types/visitorLog.types';
import { cn } from '../../../../utils/cn';

interface VisitorLogTableProps {
  logs: VisitorLogSummary[];
  className?: string;
  onCheckOut?: (log: VisitorLogSummary) => void;
}

export default function VisitorLogTable({ logs, className, onCheckOut }: VisitorLogTableProps) {
  const logsArray = Array.isArray(logs) ? logs : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Visitor</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Host</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Purpose</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Badge</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Check In</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Check Out</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logsArray.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-slate-500">
                No visitor logs found.
              </td>
            </tr>
          ) : (
            logsArray.map((log) => (
              <tr key={log.log_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link to={`/front-office/visitor-logs/${log.log_id}`} className="flex items-center gap-2 hover:underline">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900 text-sm">{log.visitor?.full_name ?? `#${log.visitor_id}`}</span>
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {log.host_employee?.name ?? `#${log.host_employee_id}`}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{log.purpose || '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600 font-mono">{log.badge_number}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{new Date(log.check_in_time).toLocaleString()}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {log.check_out_time ? new Date(log.check_out_time).toLocaleString() : '—'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      log.status === 'checked_in' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {log.status === 'checked_in' ? 'Checked In' : 'Checked Out'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/front-office/visitor-logs/${log.log_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    {log.status === 'checked_in' && (
                      <button
                        onClick={() => onCheckOut?.(log)}
                        className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Check Out
                      </button>
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
