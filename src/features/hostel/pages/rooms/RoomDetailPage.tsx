import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import RoomBedsPanel from '../../components/rooms/RoomBedsPanel';
import { ActiveBadge } from '../../components/blocks/BlockBadges';
import {
  deleteRoom,
  getRoom,
  getRoomAllotmentHistory,
  getRoomOccupancy,
  getRoomResidents,
} from '../../api/hostel.api';
import { useBlockOptions } from '../../hooks/useBlockOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { HostelRoom, ListParams } from '../../types/hostel.types';

type Tab = 'occupancy' | 'beds' | 'residents' | 'history';

const TABS: { key: Tab; label: string }[] = [
  { key: 'occupancy', label: 'Occupancy' },
  { key: 'beds', label: 'Beds' },
  { key: 'residents', label: 'Residents' },
  { key: 'history', label: 'Allotment History' },
];

export default function RoomDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('rooms');
  const { blockName } = useBlockOptions();
  const [room, setRoom] = useState<HostelRoom | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('occupancy');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getRoom(id)
      .then((data) => {
        if (!cancelled) setRoom(data);
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load room'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadOccupancy = useCallback(() => getRoomOccupancy(id!), [id]);
  const loadResidents = useCallback((params: ListParams) => getRoomResidents(id!, params), [id]);
  const loadHistory = useCallback((params: ListParams) => getRoomAllotmentHistory(id!, params), [id]);

  const handleDelete = async () => {
    if (!room || !window.confirm(`Delete room "${room.room_number}"?`)) return;
    try {
      await deleteRoom(room.room_id);
      toast.success('Room deleted');
      navigate('/hostel/rooms');
    } catch (err) {
      // e.g. rooms with current residents or allotment history can't be deleted
      if (!isAuthError(err)) toast.error(getApiErrorMessage(err, 'Failed to delete room'));
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!room) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const roomBlockName = room.block_name || room.block?.name || blockName(room.block_id) || `Block #${room.block_id}`;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/hostel/rooms" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to rooms
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Room {room.room_number}</h1>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700">
                {room.room_type}
              </span>
              {room.is_active !== undefined && <ActiveBadge active={room.is_active} />}
            </div>
            {room.description && <p className="text-slate-600 mt-1">{room.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {can('update') && (
              <Link to={`/hostel/rooms/${room.room_id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {can('delete') && (
              <Button variant="ghost" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-slate-200">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Block</dt>
            <dd className="mt-1 font-medium">
              <Link to={`/hostel/blocks/${room.block_id}`} className="text-slate-900 hover:text-[#008BE9]">
                {roomBlockName}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Floor</dt>
            <dd className="mt-1 text-slate-900 font-medium">{room.floor}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Capacity</dt>
            <dd className="mt-1 text-slate-900 font-medium">{room.capacity} beds</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Updated</dt>
            <dd className="mt-1 text-slate-900 font-medium">
              {room.updated_at ? new Date(room.updated_at).toLocaleDateString() : '—'}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="border-slate-200">
        <div className="flex gap-1 border-b border-slate-200 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
                tab === t.key
                  ? 'border-[#008BE9] text-[#008BE9]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'occupancy' && <RecordPanel key="occupancy" load={loadOccupancy} emptyMessage="No occupancy data" />}
        {tab === 'beds' && <RoomBedsPanel key="beds" roomId={String(room.room_id)} />}
        {tab === 'residents' && (
          <RecordPanel key="residents" load={loadResidents} emptyMessage="No residents in this room" />
        )}
        {tab === 'history' && (
          <RecordPanel key="history" load={loadHistory} emptyMessage="No allotment history for this room" />
        )}
      </Card>
    </div>
  );
}
