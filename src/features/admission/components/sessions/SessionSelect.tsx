import type { AdmissionSession } from '../../types/admission.types';

interface SessionSelectProps {
  id: string;
  sessions: AdmissionSession[];
  status: 'loading' | 'ready' | 'failed';
  value: number | '';
  onChange: (value: number | '') => void;
  required?: boolean;
  className?: string;
}

// Presentational: the parent owns useSessionOptions so it can also read the
// active session id. Falls back to a numeric id input if the list can't load.
export default function SessionSelect({ id, sessions, status, value, onChange, required, className }: SessionSelectProps) {
  if (status === 'failed') {
    return (
      <input
        id={id}
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder="Session ID"
        className={className}
        required={required}
      />
    );
  }

  const known = value === '' || sessions.some((session) => session.session_id === value);

  return (
    <select
      id={id}
      value={value}
      disabled={status === 'loading'}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      className={className}
      required={required}
    >
      <option value="">{status === 'loading' ? 'Loading sessions...' : 'Select session'}</option>
      {!known && <option value={value}>Session #{value}</option>}
      {sessions.map((session) => (
        <option key={session.session_id} value={session.session_id}>
          {session.name} ({session.status})
        </option>
      ))}
    </select>
  );
}
