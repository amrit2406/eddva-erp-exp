import { useEffect, useState } from 'react';
import { getResidentGatePasses } from '../../api/hostel.api';
import { toGatePassOptions, type GatePassOption } from '../../utils/discipline';

interface GatePassSelectProps {
  id: string;
  // The resident whose gate passes are offered.
  residentId: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

interface Loaded {
  residentId: string;
  options: GatePassOption[];
  failed: boolean;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500';

const PAGE_LIMIT = 50;

// Picks from one resident's gate passes. If they can't be read, it falls back to
// typing the gate pass id.
export default function GatePassSelect({ id, residentId, value, onChange, placeholder, required }: GatePassSelectProps) {
  const [result, setResult] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!residentId) return;
    let cancelled = false;
    getResidentGatePasses(residentId, { limit: PAGE_LIMIT })
      .then((res) => {
        if (!cancelled) setResult({ residentId, options: toGatePassOptions(res.data), failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ residentId, options: [], failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [residentId]);

  const current = result?.residentId === residentId ? result : null;
  const loading = !!residentId && !current;

  if (current?.failed) {
    return (
      <input
        id={id}
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Gate pass ID"
        className={inputClass}
        required={required}
      />
    );
  }

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!residentId || loading}
      className={inputClass}
      required={required}
    >
      <option value="">
        {!residentId ? 'Select a resident first' : loading ? 'Loading...' : current?.options.length === 0 ? 'No gate passes for this resident' : placeholder}
      </option>
      {current?.options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
