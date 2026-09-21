import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import RoomForm from '../../components/rooms/RoomForm';
import { createRoom } from '../../api/hostel.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage, isAuthError } from '../../utils/errors';
import type { RoomFormData } from '../../types/hostel.types';

export default function CreateRoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('rooms');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ?block_id= pre-selects the block when arriving from a filtered list.
  const initial: RoomFormData = {
    block_id: searchParams.get('block_id') ?? '',
    room_number: '',
    floor: NaN,
    room_type: '',
    capacity: NaN,
    description: '',
  };

  const handleSubmit = async (data: RoomFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createRoom(data);
      toast.success('Room created');
      navigate('/hostel/rooms');
    } catch (err) {
      if (!isAuthError(err)) setError(getApiErrorMessage(err, 'Failed to create room'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Room</h1>
        <p className="text-slate-600 mt-1">Create a room inside a hostel block</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <RoomForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Create Room"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/hostel/rooms')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
