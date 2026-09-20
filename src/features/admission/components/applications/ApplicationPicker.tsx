import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import { getApplications } from '../../api/admission.api';
import { formatDate } from '../../utils/format';
import type { Application } from '../../types/admission.types';

interface ApplicationPickerProps {
  value: Application | null;
  onChange: (application: Application | null) => void;
}

interface SearchResult {
  term: string;
  items: Application[];
  failed: boolean;
}

const nameOf = (application: Application) => application.applicant?.name ?? `Applicant #${application.applicant_id}`;

// Single-select search picker; the applications list is paginated, so a plain
// dropdown could silently miss people.
export default function ApplicationPicker({ value, onChange }: ApplicationPickerProps) {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (value) return;
    let cancelled = false;
    getApplications({ search: term, limit: 8 })
      .then((res) => {
        if (!cancelled) setResult({ term, items: res.data, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ term, items: [], failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [term, value]);

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
        <div className="min-w-0">
          <div className="font-medium text-slate-900 truncate">{nameOf(value)}</div>
          <div className="text-xs text-slate-500">
            Application #{value.application_id} · Applied {formatDate(value.application_date)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Choose a different application"
          className="text-slate-400 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const loading = result?.term !== term;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search applications..."
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
          result?.items.map((application) => (
            <button
              key={application.application_id}
              type="button"
              onClick={() => onChange(application)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 truncate">{nameOf(application)}</div>
                <div className="text-xs text-slate-500">
                  Application #{application.application_id} · Applied {formatDate(application.application_date)}
                </div>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
