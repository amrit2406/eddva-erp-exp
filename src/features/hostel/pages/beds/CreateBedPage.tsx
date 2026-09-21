import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import BlockSelect from '../../components/blocks/BlockSelect';
import { createRoomBed, getRooms } from '../../api/hostel.api';
import { useBlockOptions } from '../../hooks/useBlockOptions';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { HostelRoom } from '../../types/hostel.types';

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500';

// Rooms are fetched per block; this is a generous single page.
const ROOM_LIMIT = 200;

export default function CreateBedPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('beds');
  const { blocks, loaded } = useBlockOptions();
  const [blockId, setBlockId] = useState('');
  const [rooms, setRooms] = useState<HostelRoom[] | null>([]);
  const [roomId, setRoomId] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestBlock = useRef('');

  const loadRooms = (nextBlockId: string) => {
    latestBlock.current = nextBlockId;
    setRoomId('');
    if (!nextBlockId) {
      setRooms([]);
      return;
    }
    setRooms(null);
    getRooms({ block_id: nextBlockId, limit: ROOM_LIMIT })
      .then((result) => {
        if (latestBlock.current === nextBlockId) setRooms(result.data);
      })
      .catch((err) => {
        if (latestBlock.current !== nextBlockId) return;
        setRooms([]);
        if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to load rooms'));
      });
  };

  const handleBlockChange = (value: string) => {
    setBlockId(value);
    setError(null);
    loadRooms(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await createRoomBed(roomId, bedNumber);
      toast.success('Bed created');
      navigate('/hostel/beds');
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create bed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Bed</h1>
        <p className="text-slate-600 mt-1">Add a bed to a room</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="block_id" className="block text-sm font-medium text-slate-700 mb-1">
                    Block *
                  </label>
                  <BlockSelect
                    id="block_id"
                    value={blockId}
                    onChange={handleBlockChange}
                    blocks={blocks}
                    loaded={loaded}
                    placeholder="Select a block"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="room_id" className="block text-sm font-medium text-slate-700 mb-1">
                    Room *
                  </label>
                  <select
                    id="room_id"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    disabled={!blockId || rooms === null}
                    className={inputClass}
                    required
                  >
                    <option value="">
                      {!blockId ? 'Select a block first' : rooms === null ? 'Loading...' : 'Select a room'}
                    </option>
                    {rooms?.map((room) => (
                      <option key={room.room_id} value={String(room.room_id)}>
                        {room.room_number} (floor {room.floor}, {room.capacity} beds)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="bed_number" className="block text-sm font-medium text-slate-700 mb-1">
                    Bed Number *
                  </label>
                  <input
                    id="bed_number"
                    type="text"
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    placeholder="e.g. B1"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/hostel/beds')} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Bed'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
