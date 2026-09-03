import { Link } from 'react-router-dom';
import { Edit, Trash2, Route, MapPin } from 'lucide-react';
import type { TransportRoute } from '../../types/route.types';
import { cn } from '../../../../utils/cn';

interface RouteTableProps {
  routes: TransportRoute[];
  className?: string;
  onDelete?: (id: number) => void;
}

export default function RouteTable({ routes, className, onDelete }: RouteTableProps) {
  const routesArray = Array.isArray(routes) ? routes : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Route Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Start Location</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">End Location</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {routesArray.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-slate-500">
                No routes found. Add your first route.
              </td>
            </tr>
          ) : (
            routesArray.map((route) => (
              <tr key={route.route_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link
                    to={`/transport/routes/${route.route_id}`}
                    className="flex items-center gap-2 font-medium text-slate-900 hover:text-[#008BE9]"
                  >
                    <Route className="h-4 w-4 text-slate-400" />
                    {route.name}
                  </Link>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {route.start_location}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {route.end_location}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/transport/routes/${route.route_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(route.route_id)}
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
