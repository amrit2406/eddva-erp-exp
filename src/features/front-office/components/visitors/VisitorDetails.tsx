import { mockVisitors, mockVisitorLogs } from '../../mock/visitors.mock';
import RecordDetails from '../common/RecordDetails';
import { cn } from '../../../../utils/cn';

interface VisitorDetailsProps {
  visitorId: string;
  className?: string;
}

export default function VisitorDetails({ visitorId, className }: VisitorDetailsProps) {
  const visitor = mockVisitors.find((v) => v.id === visitorId);
  const visits = mockVisitorLogs.filter((log) => log.visitorId === visitorId);

  if (!visitor) {
    return <div className={cn('text-center py-8 text-slate-500', className)}>Visitor not found</div>;
  }

  return (
    <div className={cn('space-y-6', className)}>
      <RecordDetails
        title="Visitor Information"
        details={[
          { label: 'Full Name', value: visitor.fullName },
          { label: 'Phone', value: visitor.phone },
          { label: 'Email', value: visitor.email || '-' },
          { label: 'Organization', value: visitor.organization || '-' },
          { label: 'ID Proof Type', value: visitor.idProofType || '-' },
          { label: 'ID Proof Number', value: visitor.idProofNumber ? '•••••••••' : '-' },
          { label: 'Created At', value: new Date(visitor.createdAt).toLocaleString() },
        ]}
      />

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Visit History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Host</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Purpose</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Badge</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Check In</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Check Out</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr key={visit.id} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {new Date(visit.checkInTime).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{visit.hostEmployeeName}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{visit.purpose}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{visit.badgeNumber}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {visit.checkOutTime ? new Date(visit.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      visit.status === 'checked_in' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    )}>
                      {visit.status === 'checked_in' ? 'Checked In' : 'Checked Out'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
