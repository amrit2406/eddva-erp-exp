import { formatCell, isPlainObject, isScalar, sentenceCase, type Scalar } from '../../utils/genericSummary';

const MAX_COLUMNS = 12;
const MAX_DEPTH = 3;

// Headline numbers: a label over a value. Not a chart — one number per tile.
function StatTiles({ entries }: { entries: [string, Scalar][] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="text-sm text-slate-500">{sentenceCase(key)}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900 break-words">{formatCell(value)}</div>
        </div>
      ))}
    </div>
  );
}

// Rows of any shape: columns are the keys seen across the rows.
function RowsTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))].slice(0, MAX_COLUMNS);

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
            <tr key={index} className="border-b border-slate-100 last:border-0">
              {columns.map((column) => {
                const text = formatCell(row[column]);
                return (
                  <td key={column} className="py-2 px-4 text-sm text-slate-700 whitespace-nowrap" title={text.length > 24 ? text : undefined}>
                    <span className="inline-block max-w-xs truncate align-bottom">{text}</span>
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

function Empty({ message }: { message: string }) {
  return <div className="text-center text-slate-500 py-6">{message}</div>;
}

// A map of rows — { "Grade 5": { seats: 60, filled: 41 }, ... } — reads best as a table.
function asRowMap(data: Record<string, unknown>): Record<string, unknown>[] | null {
  const entries = Object.entries(data);
  const isRow = (value: unknown) => isPlainObject(value) && Object.values(value).every(isScalar);
  if (entries.length < 2 || !entries.every(([, value]) => isRow(value))) return null;
  return entries.map(([key, value]) => ({ item: key, ...(value as Record<string, unknown>) }));
}

interface GenericSummaryViewProps {
  data: unknown;
  emptyMessage?: string;
  depth?: number;
}

// Renders a dashboard/report payload without knowing its shape ahead of time:
// rows become a table, an object's plain values become stat tiles, and nested
// parts become their own labelled sections.
export default function GenericSummaryView({ data, emptyMessage = 'No data available', depth = 0 }: GenericSummaryViewProps) {
  if (data === null || data === undefined) return <Empty message={emptyMessage} />;

  if (Array.isArray(data)) {
    if (data.length === 0) return <Empty message={emptyMessage} />;
    if (data.every(isPlainObject)) return <RowsTable rows={data} />;
    return (
      <ul className="flex flex-wrap gap-2">
        {data.map((item, index) => (
          <li key={index} className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm">
            {formatCell(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (isPlainObject(data)) {
    const entries = Object.entries(data);
    if (entries.length === 0) return <Empty message={emptyMessage} />;

    const rowMap = asRowMap(data);
    if (rowMap) return <RowsTable rows={rowMap} />;

    const scalars = entries.filter((entry): entry is [string, Scalar] => isScalar(entry[1]));
    const nested = entries.filter(([, value]) => !isScalar(value));

    return (
      <div className="space-y-6">
        {scalars.length > 0 && <StatTiles entries={scalars} />}
        {nested.map(([key, value]) => (
          <section key={key} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{sentenceCase(key)}</h3>
            {depth < MAX_DEPTH ? (
              <GenericSummaryView data={value} emptyMessage="No data" depth={depth + 1} />
            ) : (
              <pre className="text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
            )}
          </section>
        ))}
      </div>
    );
  }

  return <StatTiles entries={[['value', data as Scalar]]} />;
}
