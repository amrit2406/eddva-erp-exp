import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import BedStatusBadge from './BedStatusBadge';
import { bedBlockLabel, bedRoomLabel } from '../../utils/beds';
import type { HostelBed } from '../../types/hostel.types';

interface BedsTableProps {
  beds: HostelBed[];
  // Show the room and block columns (hidden when listing beds of one room).
  showLocation: boolean;
  blockName: (blockId: number) => string | undefined;
  canUpdate: boolean;
  canDelete: boolean;
  emptyMessage: string;
  onEdit: (bed: HostelBed) => void;
  onDelete: (bed: HostelBed) => void;
}

export default function BedsTable({
  beds,
  showLocation,
  blockName,
  canUpdate,
  canDelete,
  emptyMessage,
  onEdit,
  onDelete,
}: BedsTableProps) {
  const columnCount = showLocation ? 5 : 3;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Bed</th>
            {showLocation && <th className="text-left py-3 px-4 font-semibold text-slate-700">Room</th>}
            {showLocation && <th className="text-left py-3 px-4 font-semibold text-slate-700">Block</th>}
            <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {beds.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="text-center py-8 text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            beds.map((bed) => (
              <tr key={bed.bed_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4">
                  <Link to={`/hostel/beds/${bed.bed_id}`} className="font-medium text-slate-900 hover:text-[#008BE9]">
                    {bed.bed_number}
                  </Link>
                </td>
                {showLocation && (
                  <td className="py-3 px-4 text-slate-600">
                    <Link to={`/hostel/rooms/${bed.room_id}`} className="hover:text-[#008BE9]">
                      {bedRoomLabel(bed)}
                    </Link>
                  </td>
                )}
                {showLocation && <td className="py-3 px-4 text-slate-600">{bedBlockLabel(bed, blockName)}</td>}
                <td className="py-3 px-4">
                  <BedStatusBadge bed={bed} />
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/hostel/beds/${bed.bed_id}`}>
                      <Button variant="ghost" size="sm" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {canUpdate && (
                      <Button variant="ghost" size="sm" title="Rename" onClick={() => onEdit(bed)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="sm" title="Delete" onClick={() => onDelete(bed)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
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
