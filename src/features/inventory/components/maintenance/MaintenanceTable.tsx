import { Link } from 'react-router-dom';
import { Edit, Wrench } from 'lucide-react';
import type { InventoryMaintenance } from '../../types/maintenance.types';
import { cn } from '../../../../utils/cn';

interface MaintenanceTableProps {
  records: InventoryMaintenance[];
  className?: string;
}

const STATUS_STYLE: Record<string, string> = {
  reported: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

export default function MaintenanceTable({ records, className }: MaintenanceTableProps) {
  const recordsArray = Array.isArray(records) ? records : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Asset Tag</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Issue Reported</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Service Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Cost</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recordsArray.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-500">
                No maintenance records found.
              </td>
            </tr>
          ) : (
            recordsArray.map((record) => (
              <tr key={record.maintenance_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 font-mono text-sm text-slate-900">
                    <Wrench className="h-3.5 w-3.5 text-slate-400" />
                    {record.asset_unit?.asset_tag ?? `#${record.asset_unit_id}`}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{record.asset_unit?.item?.name ?? '—'}</td>
                <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">{record.issue_reported}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {record.service_date ? new Date(record.service_date).toLocaleDateString() : '—'}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{record.cost != null ? `₹${record.cost}` : '—'}</td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      STATUS_STYLE[record.status] ?? 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {record.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/maintenance/${record.maintenance_id}/edit`}>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
