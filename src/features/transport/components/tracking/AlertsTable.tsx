import { Link } from 'react-router-dom';
import { AlertTriangle, Bus, CheckCircle } from 'lucide-react';
import type { TransportAlert } from '../../types/tracking.types';
import { cn } from '../../../../utils/cn';

interface AlertsTableProps {
  alerts: TransportAlert[];
  className?: string;
  showVehicle?: boolean;
  onResolve?: (id: number) => void;
}

export default function AlertsTable({ alerts, className, showVehicle = true, onResolve }: AlertsTableProps) {
  const alertsArray = Array.isArray(alerts) ? alerts : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {showVehicle && <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Vehicle</th>}
            <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Alert Type</th>
            <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Triggered At</th>
            <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Status</th>
            {onResolve && <th className="text-left py-2 px-4 text-sm font-semibold text-slate-700">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {alertsArray.length === 0 ? (
            <tr>
              <td colSpan={showVehicle ? 5 : 4} className="py-6 text-center text-slate-500">
                No alerts found.
              </td>
            </tr>
          ) : (
            alertsArray.map((alert) => (
              <tr key={alert.alert_id} className="border-b border-slate-100">
                {showVehicle && (
                  <td className="py-2 px-4 text-sm text-slate-900">
                    {alert.vehicle ? (
                      <Link
                        to={`/transport/tracking/vehicles/${alert.vehicle_id}`}
                        className="inline-flex items-center gap-1 hover:text-[#008BE9]"
                      >
                        <Bus className="h-3.5 w-3.5 text-slate-400" />
                        {alert.vehicle.registration_number}
                      </Link>
                    ) : (
                      `#${alert.vehicle_id}`
                    )}
                  </td>
                )}
                <td className="py-2 px-4 text-sm text-slate-900">
                  <span className="inline-flex items-center gap-1 capitalize">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    {alert.alert_type}
                  </span>
                </td>
                <td className="py-2 px-4 text-sm text-slate-600">
                  {new Date(alert.triggered_at).toLocaleString()}
                </td>
                <td className="py-2 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      alert.resolved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}
                  >
                    {alert.resolved ? 'Resolved' : 'Unresolved'}
                  </span>
                </td>
                {onResolve && (
                  <td className="py-2 px-4">
                    {!alert.resolved && (
                      <button
                        onClick={() => onResolve(alert.alert_id)}
                        className="inline-flex items-center gap-1 text-sm text-[#008BE9] hover:underline"
                        title="Mark resolved"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Resolve
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
