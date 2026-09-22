import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../../../components/ui/Card';
import AccessNotice from '../../components/common/AccessNotice';
import EventForm from '../../components/events/EventForm';
import { getEvent, updateEvent } from '../../api/events.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/errors';
import type { EventFormData } from '../../types/engagement.types';

// datetime-local inputs need "YYYY-MM-DDTHH:mm", not a full ISO string.
function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can, ready } = useResourceAccess('events');
  const [initial, setInitial] = useState<EventFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getEvent(id)
      .then((event) => {
        if (cancelled) return;
        setInitial({
          title: event.title,
          description: event.description ?? '',
          event_type: event.event_type,
          mode: event.mode,
          venue: event.venue ?? '',
          online_link: event.online_link ?? '',
          event_date: toLocalInput(event.event_date),
          ends_at: toLocalInput(event.ends_at),
          registration_deadline: toLocalInput(event.registration_deadline),
          max_capacity: event.max_capacity ? String(event.max_capacity) : '',
          is_paid: event.is_paid,
          ticket_price: event.ticket_price ? String(event.ticket_price) : '',
        });
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load event'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: EventFormData) => {
    if (!id) return;
    try {
      setSubmitting(true);
      setError(null);
      await updateEvent(id, data);
      toast.success('Event updated');
      navigate(`/alumni/events/${id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update event'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Event</h1>
        <p className="text-slate-600 mt-1">Update event details</p>
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
            <EventForm
              initialValues={initial}
              submitting={submitting}
              error={error}
              submitLabel="Update Event"
              submittingLabel="Updating..."
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/alumni/events/${id}`)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
