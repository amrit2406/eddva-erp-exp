import type { ReactNode } from 'react';
import Pagination from './Pagination';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

interface PagedTableProps<T> {
  columns: Column<T>[];
  // All matching rows; this component shows one page of them.
  rows: T[];
  rowKey: (row: T) => string | number;
  page: number;
  onPage: (page: number) => void;
  noun: string;
  pageSize?: number;
  minWidth?: number;
  // Row actions (icons), rendered in the last column.
  actions?: (row: T) => ReactNode;
}

// The standard list card: a plain table with headings, dividers and pagination.
export default function PagedTable<T>({ columns, rows, rowKey, page, onPage, noun, pageSize = 10, minWidth = 640, actions }: PagedTableProps<T>) {
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="animate-rise overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-slate-200/70">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              {columns.map((c, i) => (
                <th key={c.header} className={`py-3 ${i === 0 ? 'pl-5 pr-3' : 'px-3'} ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.header}
                </th>
              ))}
              {actions && (
                <th className="py-3 pl-3 pr-5">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((row) => (
              <tr key={rowKey(row)} className="transition-colors hover:bg-slate-50/80">
                {columns.map((c, i) => (
                  <td key={c.header} className={`py-3.5 ${i === 0 ? 'pl-5 pr-3' : 'px-3'} ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.className ?? ''}`}>
                    {c.cell(row)}
                  </td>
                ))}
                {actions && (
                  <td className="py-3.5 pl-3 pr-5">
                    <div className="flex items-center justify-end gap-0.5">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={current} pageSize={pageSize} total={rows.length} onPage={onPage} noun={noun} />
    </div>
  );
}
