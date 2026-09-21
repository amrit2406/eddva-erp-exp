import { useEffect, useState } from 'react';
import { getHostelUserAssignments } from '../../api/roles.api';
import type { HostelUserAssignment } from '../../types/role.types';

interface WardenSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent';

// Picks a warden from the hostel user assignments. Listing assignments can be
// restricted to Institute Admins, so when it fails this falls back to typing
// the ERP user id directly.
export default function WardenSelect({ id, value, onChange, required }: WardenSelectProps) {
  const [assignments, setAssignments] = useState<HostelUserAssignment[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getHostelUserAssignments()
      .then((data) => {
        if (!cancelled) setAssignments(data.filter((a) => a.is_active));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. usr_warden_001"
        className={inputClass}
        required={required}
      />
    );
  }

  const knownValue = !value || assignments?.some((a) => a.eddva_user_id === value);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!assignments}
      className={inputClass}
      required={required}
    >
      <option value="">{assignments ? 'Select a warden' : 'Loading...'}</option>
      {!knownValue && <option value={value}>{value}</option>}
      {assignments?.map((assignment) => (
        <option key={assignment.id} value={assignment.eddva_user_id}>
          {assignment.user_name} ({assignment.username})
        </option>
      ))}
    </select>
  );
}
