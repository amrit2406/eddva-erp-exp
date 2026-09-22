import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, Pencil, UserMinus, UserPlus, UserX } from 'lucide-react';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import Modal from '../../../../components/ui/Modal';
import RecordPanel from '../../components/common/RecordPanel';
import PhotoUploader from '../../components/profiles/PhotoUploader';
import AlumniPicker from '../../components/profiles/AlumniPicker';
import EventAttendeesPanel from '../../components/events/EventAttendeesPanel';
import EventStatusBadge from '../../components/events/EventStatusBadge';
import {
  cancelEvent,
  cancelEventRegistration,
  getEvent,
  getEventStatistics,
  markNoShows,
  registerForEvent,
  uploadEventBanner,
} from '../../api/events.api';
import { useResourceAccess } from '../../hooks/useResourceAccess';
import { useToast } from '../../../../hooks/useToast';
import { cn } from '../../../../utils/cn';
import { getApiErrorMessage } from '../../utils/errors';
import { formatValue } from '../../utils/format';
import type { AlumniProfile } from '../../types/profile.types';
import type { AlumniEvent } from '../../types/engagement.types';

type Tab = 'statistics' | 'attendees';
type ModalKind = 'cancel-event' | 'register' | 'cancel-registration' | null;

const TABS: { key: Tab; label: string }[] = [
  { key: 'statistics', label: 'Statistics' },
  { key: 'attendees', label: 'Attendees' },
];

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { can } = useResourceAccess('events');
  const [event, setEvent] = useState<AlumniEvent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('statistics');
  const [modal, setModal] = useState<ModalKind>(null);
  const [reason, setReason] = useState('');
  const [picked, setPicked] = useState<AlumniProfile | null>(null);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [attendeesKey, setAttendeesKey] = useState(0);

  const reload = async () => {
    if (!id) return;
    setEvent(await getEvent(id));
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getEvent(id)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status !== 401) setLoadError(getApiErrorMessage(err, 'Failed to load event'));
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadStatistics = useCallback(() => getEventStatistics(id!), [id]);

  const closeModal = () => {
    setModal(null);
    setReason('');
    setPicked(null);
    setActionError(null);
  };

  const handleCancelEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setActing(true);
      setActionError(null);
      await cancelEvent(id, reason);
      toast.success('Event cancelled');
      closeModal();
      await reload();
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to cancel event'));
    } finally {
      setActing(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !picked) return;
    try {
      setActing(true);
      setActionError(null);
      await registerForEvent(id, picked.profile_id);
      toast.success(`Registered ${picked.full_name}`);
      closeModal();
      setAttendeesKey((key) => key + 1);
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to register alumnus'));
    } finally {
      setActing(false);
    }
  };

  const handleCancelRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !picked) return;
    try {
      setActing(true);
      setActionError(null);
      await cancelEventRegistration(id, picked.profile_id);
      toast.success(`Cancelled ${picked.full_name}'s registration`);
      closeModal();
      setAttendeesKey((key) => key + 1);
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Failed to cancel registration'));
    } finally {
      setActing(false);
    }
  };

  const handleMarkNoShows = async () => {
    if (!id || !window.confirm('Mark every unattended registration as a no-show?')) return;
    try {
      await markNoShows(id);
      toast.success('No-shows marked');
      setAttendeesKey((key) => key + 1);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to mark no-shows'));
    }
  };

  if (loadError) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-red-500">{loadError}</div>
      </Card>
    );
  }

  if (!event) {
    return (
      <Card className="border-slate-200">
        <div className="p-8 text-center text-slate-500">Loading...</div>
      </Card>
    );
  }

  const isCancelled = event.status?.toLowerCase() === 'cancelled';

  return (
    <div className="space-y-6">
      <div>
        <Link to="/alumni/events" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-3">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to events
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{event.title}</h1>
              <EventStatusBadge status={event.status} />
            </div>
            <p className="text-slate-600 mt-1">
              {formatValue('event_date', event.event_date)} · {event.mode} ·{' '}
              {event.is_paid ? `₹${event.ticket_price}` : 'Free'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isCancelled && can('create') && (
              <Button variant="secondary" onClick={() => setModal('register')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Register Alumnus
              </Button>
            )}
            {!isCancelled && can('update') && (
              <Button variant="secondary" onClick={() => setModal('cancel-registration')}>
                <UserMinus className="h-4 w-4 mr-2" />
                Cancel Registration
              </Button>
            )}
            {!isCancelled && can('update') && (
              <Button variant="secondary" onClick={handleMarkNoShows}>
                <UserX className="h-4 w-4 mr-2" />
                Mark No-Shows
              </Button>
            )}
            {!isCancelled && can('update') && (
              <Link to={`/alumni/events/${event.event_id}/edit`}>
                <Button variant="secondary">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            {!isCancelled && (can('cancel') || can('update')) && (
              <Button variant="ghost" onClick={() => setModal('cancel-event')}>
                <Ban className="h-4 w-4 mr-2 text-red-600" />
                Cancel Event
              </Button>
            )}
          </div>
        </div>
        {event.description && <p className="text-slate-600 mt-3 max-w-3xl">{event.description}</p>}
      </div>

      <Card className="border-slate-200">
        <div className="p-4">
          <p className="text-sm font-semibold text-slate-900 mb-2">Banner</p>
          <PhotoUploader
            currentPhotoUrl={event.banner_url}
            onUpload={async (file) => {
              await uploadEventBanner(event.event_id, file);
              toast.success('Banner updated');
              await reload();
            }}
          />
        </div>
      </Card>

      <Card className="border-slate-200">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Venue</dt>
            <dd className="mt-1 text-slate-900 font-medium">{event.venue || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Online Link</dt>
            <dd className="mt-1 text-slate-900 font-medium truncate">
              {event.online_link ? (
                <a href={event.online_link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {event.online_link}
                </a>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Ends At</dt>
            <dd className="mt-1 text-slate-900 font-medium">
              {event.ends_at ? formatValue('ends_at', event.ends_at) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Registration Deadline</dt>
            <dd className="mt-1 text-slate-900 font-medium">
              {event.registration_deadline ? formatValue('registration_deadline', event.registration_deadline) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Max Capacity</dt>
            <dd className="mt-1 text-slate-900 font-medium">{event.max_capacity ?? '—'}</dd>
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
                tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'statistics' && (
          <RecordPanel key="statistics" load={loadStatistics} emptyMessage="No statistics available" />
        )}
        {tab === 'attendees' && (
          <EventAttendeesPanel key={`attendees-${attendeesKey}`} eventId={event.event_id.toString()} canManage={can('update')} />
        )}
      </Card>

      <Modal isOpen={modal === 'cancel-event'} onClose={() => !acting && closeModal()} title="Cancel Event">
        <form onSubmit={handleCancelEvent} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{actionError}</div>
          )}
          <div>
            <label htmlFor="cancel_reason" className="block text-sm font-medium text-slate-700 mb-1">
              Reason *
            </label>
            <textarea
              id="cancel_reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Venue unavailable"
              className={inputClass}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={acting}>
              Keep Event
            </Button>
            <Button type="submit" variant="primary" disabled={acting}>
              {acting ? 'Cancelling...' : 'Cancel Event'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'register'} onClose={() => !acting && closeModal()} title="Register Alumnus">
        <form onSubmit={handleRegister} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{actionError}</div>
          )}
          <AlumniPicker id="register_alumni" selected={picked} onSelect={setPicked} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={acting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={acting || !picked}>
              {acting ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modal === 'cancel-registration'} onClose={() => !acting && closeModal()} title="Cancel Registration">
        <form onSubmit={handleCancelRegistration} className="space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{actionError}</div>
          )}
          <AlumniPicker id="cancel_reg_alumni" selected={picked} onSelect={setPicked} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} disabled={acting}>
              Back
            </Button>
            <Button type="submit" variant="primary" disabled={acting || !picked}>
              {acting ? 'Cancelling...' : 'Cancel Their Registration'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
