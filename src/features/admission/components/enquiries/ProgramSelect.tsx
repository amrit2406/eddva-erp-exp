import { useProgramOptions } from '../../hooks/useProgramOptions';

interface ProgramSelectProps {
  id: string;
  value: number | '';
  onChange: (value: number | '') => void;
  required?: boolean;
  className?: string;
}

// Falls back to a numeric id input when the program list can't be loaded.
export default function ProgramSelect({ id, value, onChange, required, className }: ProgramSelectProps) {
  const { programs, status } = useProgramOptions();

  if (status === 'failed') {
    return (
      <input
        id={id}
        type="number"
        min={1}
        value={Number.isNaN(value) ? '' : value}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        placeholder="Program ID"
        className={className}
        required={required}
      />
    );
  }

  const known = value === '' || programs.some((program) => program.program_id === value);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      disabled={status === 'loading'}
      className={className}
      required={required}
    >
      <option value="">{status === 'loading' ? 'Loading programs...' : 'Select program'}</option>
      {!known && <option value={value}>Program #{value}</option>}
      {programs.map((program) => (
        <option key={program.program_id} value={program.program_id}>
          {program.name} ({program.level})
        </option>
      ))}
    </select>
  );
}
