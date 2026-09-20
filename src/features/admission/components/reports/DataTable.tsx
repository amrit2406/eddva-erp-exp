import { cn } from '../../../../utils/cn';
import { formatCell, sentenceCase } from '../../utils/reports';

const MAX_COLUMNS = 12;

const GOOD = ['sent', 'delivered', 'success', 'successful', 'completed', 'read', 'ok'];
const BAD = ['failed', 'failure', 'error', 'bounced', 'rejected', 'undelivered'];
const WAITING = ['pending', 'queued', 'scheduled', 'processing', 'retrying'];

function statusTone(value: string): string {
  const word = value.toLowerCase();
  if (GOOD.includes(word)) return 'bg-green-100 text-green-700';
  if (BAD.includes(word)) return 'bg-red-100 text-red-700';
  if (WAITING.includes(word)) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

interface DataTableProps {
  rows: Record<string, unknown>[];
  // Show the time of day on timestamps (for logs).
  showTime?: boolean;
  hideColumns?: string[];
}

// Rows of any shape: columns are the keys seen across the rows. Numbers are
// right-aligned with tabular figures so columns line up, a `status` column gets a
// labelled pill, and long text is cut with the full value in a tooltip.
export default function DataTable({ rows, showTime = false, hideColumns = [] }: DataTableProps) {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]
    .filter((column) => !hideColumns.includes(column))
    .slice(0, MAX_COLUMNS);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((column) => (
              <th key={column} className="text-left py-2.5 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                {sentenceCase(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              {columns.map((column) => {
                const value = row[column];
                const text = formatCell(value, showTime);
                const isStatus = column.toLowerCase() === 'status' && typeof value === 'string' && value !== '';
                return (
                  <td
                    key={column}
                    className={cn('py-2.5 px-4 text-slate-700', typeof value === 'number' && 'text-right tabular-nums')}
                  >
                    {isStatus ? (
                      <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', statusTone(value))}>
                        {text}
                      </span>
                    ) : (
                      <span className="block max-w-xs truncate" title={text.length > 40 ? text : undefined}>
                        {text}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
