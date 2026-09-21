import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import RoomForm from '../../components/rooms/RoomForm';
import { getRoom, updateRoom } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { RoomFormData } from '../../types/hostel.types';

export default function EditRoomPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('rooms');
  const [initial, setInitial] = useState<RoomFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getRoom(id)
      .then((room) => {
        if (cancelled) return;
        setInitial({
          block_id: String(room.block_id),
          room_number: room.room_number,
          floor: room.floor,
          room_type: room.room_type,
          capacity: room.capacity,
          description: room.description ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled && !isAuthError(err)) setLoadError(getApiErrorMessage(err, 'Failed to load room'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: RoomFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateRoom(id, data);
      toast.success('Room updated');
      navigate(`/hostel/rooms/${id}`);
    } catch (err) {
      // e.g. capacity can't drop below the current number of residents
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to update room'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Room</h1>
        <p className="text-slate-600 mt-1">Update room details and capacity</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {loadError ? (
            <div className="text-center text-red-500 py-4">{loadError}</div>
          ) : !ready || !initial ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('update') ? (
            <AccessNotice />
          ) : (
            <RoomForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Room"
              submittingLabel="Updating..."
              lockBlock
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/hostel/rooms/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
