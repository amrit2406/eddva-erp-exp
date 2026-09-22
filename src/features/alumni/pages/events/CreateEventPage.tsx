import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import EventForm from '../../components/events/EventForm';
import { createEvent } from '../../api/events.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { EventFormData } from '../../types/engagement.types';

const EMPTY: EventFormData = {
  title: '',
  description: '',
  event_type: '',
  mode: 'offline',
  venue: '',
  online_link: '',
  event_date: '',
  ends_at: '',
  registration_deadline: '',
  max_capacity: '',
  is_paid: false,
  ticket_price: '',
};

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('events');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EventFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      const event = await createEvent(data);
      toast.success('Event created');
      navigate(`/alumni/events/${event.event_id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create event'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Event</h1>
        <p className="text-slate-600 mt-1">Create a reunion, webinar or other alumni event</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-6">
          {!ready ? (
            <div className="text-center text-slate-500 py-4">Loading...</div>
          ) : !can('create') ? (
            <AccessNotice />
          ) : (
            <EventForm
              initialValues={EMPTY}
              submitting={submitting}
              error={error}
              submitLabel="Create Event"
              submittingLabel="Creating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate('/alumni/events')}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
