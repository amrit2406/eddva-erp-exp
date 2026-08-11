import { Link } from 'react-router-dom';
import { Eye, Edit, LogIn, LogOut } from 'lucide-react';
import { mockVisitors, mockVisitorLogs } from '../../mock/visitors.mock';
import StatusBadge from '../common/StatusBadge';
import { cn } from '../../../../utils/cn';

interface VisitorTableProps {
  className?: string;
}

export default function VisitorTable({ className }: VisitorTableProps) {
  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Visitor</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Phone</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Email</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Organization</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden lg:table-cell">Host</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Purpose</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden sm:table-cell">Badge</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Check-in</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700 hidden md:table-cell">Check-out</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockVisitorLogs.map((log) => {
            const visitor = mockVisitors.find((v) => v.id === log.visitorId);
            return (
              <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-2 sm:px-4">
                  <div className="font-medium text-slate-900 text-xs sm:text-sm">{log.visitorName}</div>
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600">{log.visitorPhone}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">{visitor?.email || '-'}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">{visitor?.organization || '-'}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden lg:table-cell">{log.hostEmployeeName || '-'}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{log.purpose}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{log.badgeNumber}</td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                  {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                  {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                </td>
                <td className="py-3 px-2 sm:px-4">
                  <StatusBadge status={log.status} variant="visitor" />
                </td>
                <td className="py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link to={`/front-office/visitors/${log.visitorId}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/front-office/visitors/${log.visitorId}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    {log.status === 'checked_out' ? (
                      <button className="p-1.5 hover:bg-green-100 rounded-lg text-green-600" title="Check In">
                        <LogIn className="h-4 w-4" />
                      </button>
                    ) : (
                      <button className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" title="Check Out">
                        <LogOut className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
