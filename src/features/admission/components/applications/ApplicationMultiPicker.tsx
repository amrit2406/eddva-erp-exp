import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { getApplications } from '../../api/admission.api';
import type { Application } from '../../types/admission.types';

interface ApplicationMultiPickerProps {
  // Only applications for this session and program are offered.
  sessionId: number;
  programId: number;
  // Already registered — shown but not selectable.
  excludeIds: number[];
  selected: Application[];
  onChange: (selected: Application[]) => void;
}

interface SearchResult {
  term: string;
  items: Application[];
  failed: boolean;
}

const nameOf = (application: Application) => application.applicant?.name ?? `Applicant #${application.applicant_id}`;

// Search + checklist. Selections are kept as whole applications so they survive
// changing the search term.
export default function ApplicationMultiPicker({
  sessionId,
  programId,
  excludeIds,
  selected,
  onChange,
}: ApplicationMultiPickerProps) {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    getApplications({ search: term, session_id: sessionId, program_id: programId, limit: 10 })
      .then((res) => {
        if (!cancelled) setResult({ term, items: res.data, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ term, items: [], failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [term, sessionId, programId]);

  const isSelected = (id: number) => selected.some((application) => application.application_id === id);

  const toggle = (application: Application) =>
    onChange(
      isSelected(application.application_id)
        ? selected.filter((item) => item.application_id !== application.application_id)
        : [...selected, application]
    );

  const loading = result?.term !== term;

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((application) => (
            <span
              key={application.application_id}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 pl-3 pr-1.5 py-1 text-sm"
            >
              {nameOf(application)}
              <button
                type="button"
                onClick={() => toggle(application)}
                title="Remove"
                className="rounded-full p-0.5 hover:bg-blue-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search applications for this session and program..."
          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008BE9] focus:border-transparent"
        />
      </div>

      <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 bg-white">
        {loading ? (
          <div className="px-3 py-2 text-sm text-slate-500">Searching...</div>
        ) : result?.failed ? (
          <div className="px-3 py-2 text-sm text-red-500">Couldn't load applications.</div>
        ) : result && result.items.length === 0 ? (
          <div className="px-3 py-2 text-sm text-slate-500">No matching applications.</div>
        ) : (
          result?.items.map((application) => {
            const registered = excludeIds.includes(application.application_id);
            return (
              <label
                key={application.application_id}
                className={`flex items-center gap-3 px-3 py-2 ${registered ? 'opacity-60' : 'cursor-pointer hover:bg-slate-50'}`}
              >
                <input
                  type="checkbox"
                  checked={registered || isSelected(application.application_id)}
                  disabled={registered}
                  onChange={() => toggle(application)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-900 truncate">{nameOf(application)}</div>
                  <div className="text-xs text-slate-500">
                    Application #{application.application_id}
                    {registered ? ' · Already registered' : ''}
                  </div>
                </div>
                <ApplicationStatusBadge status={application.status} />
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
