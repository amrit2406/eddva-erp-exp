import { useRef, useState } from 'react';
import BlockSelect from '../blocks/BlockSelect';
import { getRoomBeds, getRooms } from '../../api/hostel.api';
import { useBlockOptions } from '../../hooks/useBlockOptions';
import { bedStatus } from '../../utils/beds';
import type { HostelBed, HostelRoom } from '../../types/hostel.types';

interface RoomBedPickerProps {
  roomId: string;
  bedId: string;
  onChange: (value: { roomId: string; bedId: string }) => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500';

// Rooms and beds are fetched as one generous page each.
const PAGE_LIMIT = 200;

// Block -> room -> bed. Beds already reported as occupied are left out.
export default function RoomBedPicker({ roomId, bedId, onChange }: RoomBedPickerProps) {
  const { blocks, loaded } = useBlockOptions();
  const [blockId, setBlockId] = useState('');
  const [rooms, setRooms] = useState<HostelRoom[] | null>([]);
  const [beds, setBeds] = useState<HostelBed[] | null>([]);
  const [error, setError] = useState<string | null>(null);
  const latestBlock = useRef('');
  const latestRoom = useRef('');

  const handleBlockChange = (nextBlockId: string) => {
    latestBlock.current = nextBlockId;
    latestRoom.current = '';
    setBlockId(nextBlockId);
    setBeds([]);
    setError(null);
    onChange({ roomId: '', bedId: '' });
    if (!nextBlockId) {
      setRooms([]);
      return;
    }
    setRooms(null);
    getRooms({ block_id: nextBlockId, limit: PAGE_LIMIT })
      .then((result) => {
        if (latestBlock.current === nextBlockId) setRooms(result.data);
      })
      .catch(() => {
        if (latestBlock.current !== nextBlockId) return;
        setRooms([]);
        setError('Failed to load rooms');
      });
  };

  const handleRoomChange = (nextRoomId: string) => {
    latestRoom.current = nextRoomId;
    setError(null);
    onChange({ roomId: nextRoomId, bedId: '' });
    if (!nextRoomId) {
      setBeds([]);
      return;
    }
    setBeds(null);
    getRoomBeds(nextRoomId, { limit: PAGE_LIMIT })
      .then((result) => {
        if (latestRoom.current === nextRoomId) setBeds(result.data.filter((bed) => bedStatus(bed) !== 'occupied'));
      })
      .catch(() => {
        if (latestRoom.current !== nextRoomId) return;
        setBeds([]);
        setError('Failed to load beds');
      });
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label htmlFor="picker_block" className="block text-sm font-medium text-slate-700 mb-1">
            Block *
          </label>
          <BlockSelect
            id="picker_block"
            value={blockId}
            onChange={handleBlockChange}
            blocks={blocks}
            loaded={loaded}
            placeholder="Select a block"
            required
          />
        </div>

        <div>
          <label htmlFor="picker_room" className="block text-sm font-medium text-slate-700 mb-1">
            Room *
          </label>
          <select
            id="picker_room"
            value={roomId}
            onChange={(e) => handleRoomChange(e.target.value)}
            disabled={!blockId || rooms === null}
            className={inputClass}
            required
          >
            <option value="">{!blockId ? 'Select a block first' : rooms === null ? 'Loading...' : 'Select a room'}</option>
            {rooms?.map((room) => (
              <option key={room.room_id} value={String(room.room_id)}>
                {room.room_number} (floor {room.floor})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="picker_bed" className="block text-sm font-medium text-slate-700 mb-1">
            Bed *
          </label>
          <select
            id="picker_bed"
            value={bedId}
            onChange={(e) => onChange({ roomId, bedId: e.target.value })}
            disabled={!roomId || beds === null}
            className={inputClass}
            required
          >
            <option value="">
              {!roomId
                ? 'Select a room first'
                : beds === null
                  ? 'Loading...'
                  : beds.length === 0
                    ? 'No free beds'
                    : 'Select a bed'}
            </option>
            {beds?.map((bed) => (
              <option key={bed.bed_id} value={String(bed.bed_id)}>
                {bed.bed_number}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
