import { ArrowDownUp, Search, X } from 'lucide-react';

export interface SortOption {
  value: string;
  label: string;
}

interface ListToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
  sort: string;
  onSort: (value: string) => void;
  sortOptions: SortOption[];
  resultLabel: string;
}

// Search + sort row above a list, with a live result count.
export default function ListToolbar({ search, onSearch, placeholder, sort, onSort, sortOptions, resultLabel }: ListToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-soft ring-1 ring-slate-200/70 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <label className="relative flex items-center">
          <ArrowDownUp className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            aria-label="Sort by"
            className="appearance-none rounded-2xl bg-white py-2.5 pl-9 pr-8 text-sm text-slate-700 shadow-soft ring-1 ring-slate-200/70 focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="whitespace-nowrap text-xs text-slate-500">{resultLabel}</p>
      </div>
    </div>
  );
}
