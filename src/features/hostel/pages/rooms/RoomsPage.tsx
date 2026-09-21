import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import PaginationBar from '../../components/common/PaginationBar';
import RecordPanel from '../../components/common/RecordPanel';
import BlockSelect from '../../components/blocks/BlockSelect';
import { ActiveBadge } from '../../components/blocks/BlockBadges';
import { deleteRoom, getAvailableRooms, getRoomVacancy, getRooms } from '../../api/hostel.api';
import { useBlockOptions } from '../../hooks/useBlockOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { HostelRoom, ListParams, Pagination } from '../../types/hostel.types';

type View = 'all' | 'vacancy' | 'available';

const VIEWS: { key: View; label: string }[] = [
  { key: 'all', label: 'All Rooms' },
  { key: 'vacancy', label: 'Vacancy' },
  { key: 'available', label: 'Available' },
];

const PAGE_SIZE = 20;

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

export default function RoomsPage() {
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('rooms');
  const { blocks, loaded, blockName } = useBlockOptions();
  const [view, setView] = useState<View>('all');
  const [blockId, setBlockId] = useState('');
  const [floor, setFloor] = useState('');
  const [page, setPage] = useState(1);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (view !== 'all') return;
    let cancelled = false;
    setLoading(true);
    getRooms({ page, limit: PAGE_SIZE, block_id: blockId, floor })
      .then((result) => {
        if (cancelled) return;
        setRooms(result.data);
        setPagination(result.pagination ?? null);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to load rooms'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [view, page, blockId, floor, reloadKey]);

  const loadVacancy = useCallback(
    (params: ListParams) => getRoomVacancy({ ...params, block_id: blockId, floor }),
    [blockId, floor]
  );
  const loadAvailable = useCallback(
    (params: ListParams) => getAvailableRooms({ ...params, block_id: blockId, floor }),
    [blockId, floor]
  );

  const handleDelete = useCallback(
    async (room: HostelRoom) => {
      if (!window.confirm(`Delete room "${room.room_number}"?`)) return;
      try {
        await deleteRoom(room.room_id);
        toast.success('Room deleted');
        if (rooms.length === 1 && page > 1) setPage(page - 1);
        else setReloadKey((key) => key + 1);
      } catch (err) {
        // e.g. rooms with current residents or allotment history can't be deleted
        if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete room'));
      }
    },
    [page, rooms.length, toast]
  );

  const addRoomLink = blockId ? `/hostel/rooms/new?block_id=${blockId}` : '/hostel/rooms/new';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rooms</h1>
          <p className="text-slate-600 mt-1">Rooms and beds across hostel blocks</p>
        </div>
        {can('create') && (
          <Link to={addRoomLink}>
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </Link>
        )}
      </div>

      {ready && !can('create') && <AccessNotice />}

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => {
                setView(v.key);
                setPage(1);
              }}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                view === v.key
                  ? 'border-[#008BE9] text-[#008BE9]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3">
          <BlockSelect
            id="filter_block"
            value={blockId}
            onChange={(value) => {
              setBlockId(value);
              setPage(1);
            }}
            blocks={blocks}
            loaded={loaded}
            placeholder="All blocks"
            className={inputClass}
          />
          <input
            type="number"
            min={0}
            placeholder="Floor"
            value={floor}
            onChange={(e) => {
              setFloor(e.target.value);
              setPage(1);
            }}
            className={`${inputClass} md:w-32`}
          />
        </div>

        {view === 'vacancy' && (
          <RecordPanel
            key={`vacancy-${blockId}-${floor}`}
            load={loadVacancy}
            emptyMessage="No vacancy data"
            pageSize={PAGE_SIZE}
          />
        )}
        {view === 'available' && (
          <RecordPanel
            key={`available-${blockId}-${floor}`}
            load={loadAvailable}
            emptyMessage="No rooms with free beds"
            pageSize={PAGE_SIZE}
          />
        )}

        {view === 'all' &&
          (loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Room</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Block</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Floor</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Capacity</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500">
                          No rooms found
                        </td>
                      </tr>
                    ) : (
                      rooms.map((room) => (
                        <tr key={room.room_id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <Link
                              to={`/hostel/rooms/${room.room_id}`}
                              className="font-medium text-slate-900 hover:text-[#008BE9]"
                            >
                              {room.room_number}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {room.block_name || room.block?.name || blockName(room.block_id) || `#${room.block_id}`}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{room.floor}</td>
                          <td className="py-3 px-4 text-slate-600 capitalize">{room.room_type}</td>
                          <td className="py-3 px-4 text-slate-600">{room.capacity}</td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            {room.is_active !== undefined ? <ActiveBadge active={room.is_active} /> : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/hostel/rooms/${room.room_id}`}>
                                <Button variant="ghost" size="sm" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {can('update') && (
                                <Link to={`/hostel/rooms/${room.room_id}/edit`}>
                                  <Button variant="ghost" size="sm" title="Edit">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              {can('delete') && (
                                <Button variant="ghost" size="sm" title="Delete" onClick={() => handleDelete(room)}>
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
              {pagination && <PaginationBar pagination={pagination} onPageChange={setPage} />}
            </>
          ))}
      </Card>
    </div>
  );
}
