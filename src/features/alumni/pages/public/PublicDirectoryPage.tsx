import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import RecordPanel from '../../components/common/RecordPanel';
import { getPublicDirectory } from '../../api/publicDirectory.api';
import type { ListParams } from '../../types/profile.types';

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

// Preview of what the public directory endpoint returns — the same data a
// visitor to the public site would see, with no permission required.
export default function PublicDirectoryPage() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback((params: ListParams) => getPublicDirectory({ ...params, search: debounced }), [debounced]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Public Directory</h1>
        <p className="text-slate-600 mt-1">Preview of the alumni listing visible to the public, with no sign-in required</p>
      </div>

      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search the public directory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 ${inputClass}`}
            />
          </div>
        </div>

        <RecordPanel key={debounced} load={load} emptyMessage="No public profiles found" />
      </Card>
    </div>
  );
}
