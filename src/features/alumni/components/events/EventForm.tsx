import { useState } from 'react';
import Button from '../../../../components/ui/Button';
import type { EventFormData } from '../../types/engagement.types';

interface EventFormProps {
  initialValues: EventFormData;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

const TYPE_SUGGESTIONS = ['reunion', 'webinar', 'networking', 'fundraiser', 'workshop'];
const MODE_OPTIONS = ['offline', 'online', 'hybrid'];

export default function EventForm({
  initialValues,
  submitting,
  error,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: EventFormProps) {
  const [form, setForm] = useState<EventFormData>(initialValues);
  const set = <K extends keyof EventFormData>(key: K, value: EventFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Class of 2015 Reunion"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="event_type" className="block text-sm font-medium text-slate-700 mb-1">
            Event Type *
          </label>
          <input
            id="event_type"
            type="text"
            list="event-types"
            value={form.event_type}
            onChange={(e) => set('event_type', e.target.value)}
            placeholder="e.g. reunion"
            className={inputClass}
            required
          />
          <datalist id="event-types">
            {TYPE_SUGGESTIONS.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="mode" className="block text-sm font-medium text-slate-700 mb-1">
            Mode *
          </label>
          <select id="mode" value={form.mode} onChange={(e) => set('mode', e.target.value)} className={inputClass} required>
            {MODE_OPTIONS.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </div>

        {form.mode !== 'online' && (
          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-slate-700 mb-1">
              Venue
            </label>
            <input
              id="venue"
              type="text"
              value={form.venue}
              onChange={(e) => set('venue', e.target.value)}
              placeholder="e.g. School Auditorium"
              className={inputClass}
            />
          </div>
        )}

        {form.mode !== 'offline' && (
          <div>
            <label htmlFor="online_link" className="block text-sm font-medium text-slate-700 mb-1">
              Online Link
            </label>
            <input
              id="online_link"
              type="url"
              value={form.online_link}
              onChange={(e) => set('online_link', e.target.value)}
              placeholder="https://meet.example.com/..."
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label htmlFor="event_date" className="block text-sm font-medium text-slate-700 mb-1">
            Starts At *
          </label>
          <input
            id="event_date"
            type="datetime-local"
            value={form.event_date}
            onChange={(e) => set('event_date', e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="ends_at" className="block text-sm font-medium text-slate-700 mb-1">
            Ends At
          </label>
          <input
            id="ends_at"
            type="datetime-local"
            value={form.ends_at}
            onChange={(e) => set('ends_at', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="registration_deadline" className="block text-sm font-medium text-slate-700 mb-1">
            Registration Deadline
          </label>
          <input
            id="registration_deadline"
            type="datetime-local"
            value={form.registration_deadline}
            onChange={(e) => set('registration_deadline', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="max_capacity" className="block text-sm font-medium text-slate-700 mb-1">
            Max Capacity
          </label>
          <input
            id="max_capacity"
            type="number"
            min={1}
            value={form.max_capacity}
            onChange={(e) => set('max_capacity', e.target.value)}
            placeholder="e.g. 100"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
          <input
            type="checkbox"
            checked={form.is_paid}
            onChange={(e) => set('is_paid', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          This is a paid event
        </label>
        {form.is_paid && (
          <div className="md:w-1/3">
            <label htmlFor="ticket_price" className="block text-sm font-medium text-slate-700 mb-1">
              Ticket Price *
            </label>
            <input
              id="ticket_price"
              type="number"
              min={0}
              step="0.01"
              value={form.ticket_price}
              onChange={(e) => set('ticket_price', e.target.value)}
              placeholder="e.g. 500"
              className={inputClass}
              required
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
