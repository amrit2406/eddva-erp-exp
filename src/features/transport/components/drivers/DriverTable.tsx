import { Link } from 'react-router-dom';
import { Edit, User, Phone, IdCard } from 'lucide-react';
import type { TransportDriver } from '../../types/driver.types';
import { cn } from '../../../../utils/cn';

interface DriverTableProps {
  drivers: TransportDriver[];
  className?: string;
}

export default function DriverTable({ drivers, className }: DriverTableProps) {
  const driversArray = Array.isArray(drivers) ? drivers : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Phone</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">License No.</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">License Expiry</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {driversArray.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-slate-500">
                No drivers found. Add your first driver.
              </td>
            </tr>
          ) : (
            driversArray.map((driver) => (
              <tr key={driver.driver_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link
                    to={`/transport/drivers/${driver.driver_id}`}
                    className="flex items-center gap-2 font-medium text-slate-900 hover:text-[#008BE9]"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    {driver.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {driver.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {driver.phone}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {driver.license_number ? (
                    <span className="inline-flex items-center gap-1 font-mono">
                      <IdCard className="h-3.5 w-3.5 text-slate-400" />
                      {driver.license_number}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : '—'}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {driver.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/transport/drivers/${driver.driver_id}/edit`}>
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
