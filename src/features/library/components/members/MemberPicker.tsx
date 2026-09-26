import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { StatusPill } from '../../../../components/premium/list/ListControls';
import { inputClass } from '../../../../components/premium/styles';
import { getMembers } from '../../api/library.api';
import type { Member } from '../../types/library.types';
import { memberStatusInfo, memberTypeInfo } from '../../utils/labels';

interface MemberPickerProps {
  value: Member | null;
  onChange: (member: Member | null) => void;
  autoFocus?: boolean;
}

// Type a name, card number or school ID (a card scanner types + Enter) and pick the member.
export default function MemberPicker({ value, onChange, autoFocus }: MemberPickerProps) {
  const { data: members = [] } = useQuery({ queryKey: ['library', 'members'], queryFn: () => getMembers() });
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return members.filter((m) => [m.name, m.library_card_number, m.external_ref_id].some((v) => v?.toLowerCase().includes(q))).slice(0, 6);
  }, [members, query]);

  if (value) {
    const type = memberTypeInfo(value.member_type);
    const status = memberStatusInfo(value.status);
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-brand/5 px-4 py-3 ring-1 ring-brand/20">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900">{value.name}</p>
          <p className="text-xs text-slate-500">
            Card {value.library_card_number} · {type.label}
          </p>
        </div>
        {value.status !== 'active' && <StatusPill label={status.label} color={status.color} />}
        <button type="button" onClick={() => onChange(null)} aria-label="Choose someone else" className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const exact = members.find((m) => m.library_card_number.toLowerCase() === query.trim().toLowerCase());
              if (exact ?? matches.length === 1) onChange(exact ?? matches[0]);
            }
          }}
          placeholder="Name, card number or school ID"
          autoFocus={autoFocus}
          autoComplete="off"
          className={`${inputClass} pl-9`}
        />
      </div>
      {query.trim() && (
        <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-2xl ring-1 ring-slate-200">
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-500">No member matches “{query.trim()}”.</li>
          ) : (
            matches.map((m) => {
              const status = memberStatusInfo(m.status);
              return (
                <li key={m.member_id}>
                  <button type="button" onClick={() => onChange(m)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-slate-50">
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-900">{m.name}</span>
                      <span className="block text-xs text-slate-500">
                        {m.library_card_number} · {memberTypeInfo(m.member_type).label}
                      </span>
                    </span>
                    {m.status !== 'active' && (
                      <span className="ml-auto">
                        <StatusPill label={status.label} color={status.color} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
