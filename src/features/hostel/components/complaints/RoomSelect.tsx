import { useEffect, useState } from 'react';
import BlockSelect from '../blocks/BlockSelect';
import { getRooms } from '../../api/hostel.api';
import { useBlockOptions } from '../../hooks/useBlockOptions';
import type { HostelRoom } from '../../types/hostel.types';

interface RoomSelectProps {
  roomId: string;
  onChange: (roomId: string) => void;
}

interface Loaded {
  blockId: string;
  rooms: HostelRoom[];
  failed: boolean;
}

const PAGE_LIMIT = 200;

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500';

// Block -> room. Every room is offered, occupied or not (a complaint isn't about vacancy).
export default function RoomSelect({ roomId, onChange }: RoomSelectProps) {
  const { blocks, loaded: blocksLoaded } = useBlockOptions();
  const [blockId, setBlockId] = useState('');
  const [result, setResult] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!blockId) return;
    let cancelled = false;
    getRooms({ block_id: blockId, limit: PAGE_LIMIT })
      .then((res) => {
        if (!cancelled) setResult({ blockId, rooms: res.data, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ blockId, rooms: [], failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [blockId]);

  const current = result?.blockId === blockId ? result : null;
  const loadingRooms = !!blockId && !current;

  const changeBlock = (next: string) => {
    setBlockId(next);
    onChange('');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <BlockSelect
        id="complaint_block"
        value={blockId}
        onChange={changeBlock}
        blocks={blocks}
        loaded={blocksLoaded}
        placeholder="Select a block"
      />
      <div>
        <select
          id="complaint_room"
          value={roomId}
          onChange={(e) => onChange(e.target.value)}
          disabled={!blockId || loadingRooms}
          className={inputClass}
          aria-label="Room"
        >
          <option value="">
            {!blockId ? 'Select a block first' : loadingRooms ? 'Loading...' : current?.failed ? 'Could not load rooms' : 'Select a room'}
          </option>
          {current?.rooms.map((room) => (
            <option key={room.room_id} value={String(room.room_id)}>
              {room.room_number} (floor {room.floor})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
