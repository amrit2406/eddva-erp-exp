import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  // e.g. "orders" -> "Showing 1–10 of 23 orders".
  noun?: string;
}

// Page numbers with the current page's neighbours, first/last, and gaps.
function pageList(page: number, pages: number): (number | 'gap')[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1]);
  const list: (number | 'gap')[] = [];
  for (let p = 1; p <= pages; p++) {
    if (!wanted.has(p)) continue;
    const last = list[list.length - 1];
    if (typeof last === 'number' && p - last > 1) list.push('gap');
    list.push(p);
  }
  return list;
}

export default function Pagination({ page, pageSize, total, onPage, noun = 'items' }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const button = 'flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-medium transition';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-900 tabular-nums">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-900 tabular-nums">{total}</span> {noun}
      </p>
      {pages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className={`${button} text-slate-600 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {pageList(page, pages).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} className="px-1 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPage(p)}
                aria-current={p === page ? 'page' : undefined}
                className={`${button} tabular-nums ${p === page ? 'bg-brand-navy text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => onPage(page + 1)}
            disabled={page === pages}
            aria-label="Next page"
            className={`${button} text-slate-600 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-40`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
