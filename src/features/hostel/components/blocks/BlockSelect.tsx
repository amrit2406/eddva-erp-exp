import type { HostelBlock } from '../../types/hostel.types';

interface BlockSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  blocks: HostelBlock[];
  loaded: boolean;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500';

export default function BlockSelect({
  id,
  value,
  onChange,
  blocks,
  loaded,
  placeholder,
  required,
  disabled,
  className,
}: BlockSelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || !loaded}
      required={required}
      className={className ?? inputClass}
    >
      <option value="">{loaded ? placeholder : 'Loading...'}</option>
      {blocks.map((block) => (
        <option key={block.block_id} value={String(block.block_id)}>
          {block.name}
          {block.is_active ? '' : ' (inactive)'}
        </option>
      ))}
    </select>
  );
}
