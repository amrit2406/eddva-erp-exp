import { Link } from 'react-router-dom';
import { Edit, Trash2, Bus, Users, Navigation } from 'lucide-react';
import type { TransportVehicle } from '../../types/vehicle.types';
import { cn } from '../../../../utils/cn';

interface VehicleTableProps {
  vehicles: TransportVehicle[];
  className?: string;
  onDelete?: (id: number) => void;
}

export default function VehicleTable({ vehicles, className, onDelete }: VehicleTableProps) {
  const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Registration No.</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Model</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Capacity</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehiclesArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No vehicles found. Add your first vehicle.
              </td>
            </tr>
          ) : (
            vehiclesArray.map((vehicle) => (
              <tr key={vehicle.vehicle_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900 font-mono text-sm">
                      {vehicle.registration_number}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">{vehicle.model}</td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {vehicle.capacity}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      vehicle.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {vehicle.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/transport/tracking/vehicles/${vehicle.vehicle_id}`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Track">
                        <Navigation className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link to={`/transport/vehicles/${vehicle.vehicle_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(vehicle.vehicle_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
