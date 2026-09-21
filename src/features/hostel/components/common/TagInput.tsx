import { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  id?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

// Free-text list input: Enter or a comma adds a tag, Backspace on an empty box
// removes the last one. Leftover text is added on blur so it isn't silently lost.
export default function TagInput({ id, value, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const next = raw
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part && !value.includes(part));
    if (next.length > 0) onChange([...value, ...new Set(next)]);
    setDraft('');
  };

  const remove = (tag: string) => onChange(value.filter((item) => item !== tag));

  return (
    <div className="flex flex-wrap items-center gap-2 w-full px-2 py-1.5 border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-[#008BE9] focus-within:border-transparent">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 pl-3 pr-1.5 py-1 text-sm">
          {tag}
          <button type="button" onClick={() => remove(tag)} title="Remove" className="rounded-full p-0.5 hover:bg-slate-200">
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={draft}
        placeholder={value.length === 0 ? placeholder : undefined}
        onChange={(e) => {
          // Typing or pasting a comma commits what's before it.
          if (e.target.value.includes(',')) commit(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit(draft);
          } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
        className="flex-1 min-w-[8rem] px-1 py-1 text-sm bg-transparent focus:outline-none"
      />
    </div>
  );
}
