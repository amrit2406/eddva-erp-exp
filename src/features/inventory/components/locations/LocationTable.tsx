import { Link } from 'react-router-dom';
import { Edit, MapPin } from 'lucide-react';
import type { InventoryLocation } from '../../types/location.types';
import { cn } from '../../../../utils/cn';

interface LocationTableProps {
  locations: InventoryLocation[];
  className?: string;
}

function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function LocationTable({ locations, className }: LocationTableProps) {
  const locationsArray = Array.isArray(locations) ? locations : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {locationsArray.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-500">
                No locations found. Add your first location.
              </td>
            </tr>
          ) : (
            locationsArray.map((location) => (
              <tr key={location.location_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-900">{location.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {formatType(location.type)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      location.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {location.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/inventory/locations/${location.location_id}/edit`}>
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
