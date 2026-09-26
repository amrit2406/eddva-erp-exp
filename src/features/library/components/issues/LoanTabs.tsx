import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftRight, Check, ListChecks, TriangleAlert, UserCog } from 'lucide-react';
import { useLibrarianStore } from '../../stores/librarian.store';

const TABS = [
  { path: '/library/issues/desk', label: 'Desk', icon: ArrowLeftRight },
  { path: '/library/issues', label: 'All loans', icon: ListChecks },
  { path: '/library/issues/overdue', label: 'Overdue', icon: TriangleAlert },
];

// Switch between the lending desk and the loan lists; also shows which librarian ID is recorded.
export default function LoanTabs({ overdue }: { overdue?: number }) {
  const { pathname } = useLocation();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav className="inline-flex flex-wrap rounded-2xl bg-white p-1 shadow-soft ring-1 ring-slate-200/70" aria-label="Loans">
        {TABS.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition ${active ? 'bg-brand-navy text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {path.endsWith('overdue') && overdue ? (
                <span className={`rounded-full px-1.5 text-xs font-semibold ${active ? 'bg-white/20' : 'bg-red-50 text-red-600'}`}>{overdue}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <LibrarianChip />
    </div>
  );
}

// Issue, return and renew record a librarian ID; this lets staff set theirs.
function LibrarianChip() {
  const { librarianId, setLibrarianId } = useLibrarianStore();
  const [draft, setDraft] = useState<string | null>(null);

  if (draft !== null) {
    const save = () => {
      const parsed = parseInt(draft, 10);
      if (parsed > 0) setLibrarianId(parsed);
      setDraft(null);
    };
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="inline-flex items-center gap-1.5 text-xs text-slate-600"
      >
        <UserCog className="h-4 w-4 text-slate-400" />
        Librarian #
        <input type="number" min={1} autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={save} className="w-16 rounded-lg bg-white px-2 py-1 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-brand" />
        <button type="submit" aria-label="Save librarian ID" className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
          <Check className="h-4 w-4" />
        </button>
      </form>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setDraft(String(librarianId))}
      title="Loans you lend, take back or renew are recorded under this librarian ID. Click to change."
      className="inline-flex items-center gap-1.5 self-start rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
    >
      <UserCog className="h-3.5 w-3.5" /> Working as librarian #{librarianId}
    </button>
  );
}
