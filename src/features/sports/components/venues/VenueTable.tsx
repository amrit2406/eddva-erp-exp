import { Link } from 'react-router-dom';
import { Edit, Trash2, MapPin, Users } from 'lucide-react';
import type { Venue } from '../../types/sports.types';
import { cn } from '../../../../utils/cn';

interface VenueTableProps {
  venues: Venue[];
  className?: string;
  onDelete?: (id: number) => void;
}

const TYPE_LABEL: Record<Venue['type'], string> = {
  ground: 'Ground',
  court: 'Court',
  pool: 'Pool',
  hall: 'Hall',
};

export default function VenueTable({ venues, className, onDelete }: VenueTableProps) {
  const venuesArray = Array.isArray(venues) ? venues : [];

  return (
    <div className={cn('overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[750px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Capacity</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Location</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {venuesArray.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-slate-500">
                No venues found. Add your first venue.
              </td>
            </tr>
          ) : (
            venuesArray.map((venue) => (
              <tr key={venue.venue_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium text-slate-900">{venue.name}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {TYPE_LABEL[venue.type] ?? venue.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {venue.capacity != null ? (
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {venue.capacity}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4 text-sm text-slate-600">
                  {venue.location ? (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {venue.location}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/sports/venues/${venue.venue_id}/edit`}>
                      <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                    <button
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600"
                      title="Delete"
                      onClick={() => onDelete?.(venue.venue_id)}
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
