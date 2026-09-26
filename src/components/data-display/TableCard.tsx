import type { ReactNode } from 'react';
import Card from '../ui/Card';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right';
}

// Plain titled table for dashboard list sections.
export default function TableCard<T>({ title, rows, columns, rowKey }: { title: string; rows: T[]; columns: Column<T>[]; rowKey: (row: T) => string }) {
  return (
    <Card className="border-slate-200">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">No data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {columns.map((column) => (
                    <th
                      key={column.header}
                      className={`py-2 px-2 font-medium text-slate-500 whitespace-nowrap ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={rowKey(row)} className="border-b border-slate-100 last:border-0">
                    {columns.map((column) => (
                      <td
                        key={column.header}
                        className={`py-2 px-2 text-slate-800 whitespace-nowrap ${column.align === 'right' ? 'text-right tabular-nums' : ''}`}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
