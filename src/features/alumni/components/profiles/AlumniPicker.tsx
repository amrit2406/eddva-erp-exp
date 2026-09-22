import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { getProfiles } from '../../api/profiles.api';
import type { AlumniProfile } from '../../types/profile.types';

interface AlumniPickerProps {
  id: string;
  selected: AlumniProfile | null;
  onSelect: (profile: AlumniProfile | null) => void;
  // Results already picked elsewhere (e.g. already a group member) are hidden.
  exclude?: number[];
}

const MIN_QUERY = 2;

// Search-as-you-type alumni chooser, shared by Groups (add member) and Events
// (register on someone's behalf).
export default function AlumniPicker({ id, selected, onSelect, exclude = [] }: AlumniPickerProps) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<{ query: string; data: AlumniProfile[] } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debounced.length < MIN_QUERY) return;
    let cancelled = false;
    getProfiles({ search: debounced, limit: 8 })
      .then((result) => {
        if (!cancelled) setResults({ query: debounced, data: result.data });
      })
      .catch(() => {
        if (!cancelled) setResults({ query: debounced, data: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50">
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">{selected.full_name}</p>
          <p className="text-xs text-slate-500 truncate">{selected.email}</p>
        </div>
        <button type="button" onClick={() => onSelect(null)} className="p-1 text-slate-500 hover:text-slate-900" title="Change">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const searching = debounced.length >= MIN_QUERY;
  const loading = searching && results?.query !== debounced;
  const options = results?.data.filter((profile) => !exclude.includes(profile.profile_id)) ?? [];

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email..."
        autoComplete="off"
        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {query.trim().length >= MIN_QUERY && (
        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {loading ? (
            <li className="px-3 py-2 text-sm text-slate-500">Searching...</li>
          ) : options.length > 0 ? (
            options.map((profile) => (
              <li key={profile.profile_id}>
                <button
                  type="button"
                  onClick={() => onSelect(profile)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                >
                  <span className="block font-medium text-slate-900">{profile.full_name}</span>
                  <span className="block text-xs text-slate-500">{profile.email}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-slate-500">No alumni found</li>
          )}
        </ul>
      )}
    </div>
  );
}
