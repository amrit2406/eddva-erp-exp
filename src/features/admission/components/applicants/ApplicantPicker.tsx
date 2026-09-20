import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { getApplicants } from '../../api/admission.api';
import { formatDate } from '../../utils/format';
import type { Applicant } from '../../types/admission.types';

interface ApplicantPickerProps {
  value: Applicant | null;
  onChange: (applicant: Applicant | null) => void;
}

interface SearchResult {
  term: string;
  items: Applicant[];
  failed: boolean;
}

// Search-as-you-type picker: the applicants list is paginated, so a plain
// dropdown could silently miss people.
export default function ApplicantPicker({ value, onChange }: ApplicantPickerProps) {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!term) return;
    let cancelled = false;
    getApplicants({ search: term, limit: 5 })
      .then((res) => {
        if (!cancelled) setResult({ term, items: res.data, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ term, items: [], failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [term]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
        <div className="min-w-0">
          <div className="font-medium text-slate-900 truncate">{value.name}</div>
          <div className="text-xs text-slate-500">
            #{value.applicant_id} · Born {formatDate(value.dob)}
            {value.guardian_name ? ` · Guardian: ${value.guardian_name}` : ''}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Choose a different applicant"
          className="text-slate-400 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const searching = term !== '' && result?.term !== term;
  const current = term !== '' && result?.term === term ? result : null;

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search applicants by name..."
          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
        />
      </div>
      {query.trim() !== '' && (
        <div className="mt-2 rounded-lg border border-slate-200 divide-y divide-slate-100">
          {searching || query.trim() !== term ? (
            <div className="px-3 py-2 text-sm text-slate-500">Searching...</div>
          ) : current?.failed ? (
            <div className="px-3 py-2 text-sm text-red-500">Couldn't search applicants.</div>
          ) : current && current.items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No matching applicants.</div>
          ) : (
            current?.items.map((applicant) => (
              <button
                key={applicant.applicant_id}
                type="button"
                onClick={() => {
                  onChange(applicant);
                  setQuery('');
                  setTerm('');
                }}
                className="block w-full px-3 py-2 text-left hover:bg-slate-50"
              >
                <div className="text-sm font-medium text-slate-900">{applicant.name}</div>
                <div className="text-xs text-slate-500">
                  #{applicant.applicant_id} · Born {formatDate(applicant.dob)}
                  {applicant.guardian_name ? ` · Guardian: ${applicant.guardian_name}` : ''}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
