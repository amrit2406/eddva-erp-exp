import { useEffect, useState } from 'react';
import { getRoomBeds } from '../../api/hostel.api';
import { bedStatus } from '../../utils/beds';
import type { HostelBed } from '../../types/hostel.types';

interface BedSelectProps {
  id: string;
  roomId: string;
  value: string;
  onChange: (value: string) => void;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500';

// Beds of one known room. Occupied beds are left out, except the currently
// selected one. Without a room id it falls back to typing the bed id.
export default function BedSelect({ id, roomId, value, onChange }: BedSelectProps) {
  const [beds, setBeds] = useState<HostelBed[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    getRoomBeds(roomId, { limit: 200 })
      .then((result) => {
        if (!cancelled) setBeds(result.data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  if (!roomId || failed) {
    return (
      <input
        id={id}
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Bed id"
        className={inputClass}
        required
      />
    );
  }

  const options = (beds ?? []).filter((bed) => bedStatus(bed) !== 'occupied' || String(bed.bed_id) === value);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={beds === null}
      className={inputClass}
      required
    >
      <option value="">{beds === null ? 'Loading...' : options.length === 0 ? 'No free beds' : 'Select a bed'}</option>
      {options.map((bed) => (
        <option key={bed.bed_id} value={String(bed.bed_id)}>
          {bed.bed_number}
        </option>
      ))}
    </select>
  );
}
