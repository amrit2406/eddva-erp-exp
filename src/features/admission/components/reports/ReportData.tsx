import DataTable from './DataTable';
import StatTiles from './StatTiles';
import { formatCell, isPlainObject, isScalar, sentenceCase } from '../../utils/reports';

const MAX_DEPTH = 3;

function Empty() {
  return <div className="text-center text-slate-500 py-6">No data for this report</div>;
}

// A map of rows — { "Grade 5": { seats: 60, filled: 41 }, ... } — reads best as a table.
function asRowMap(data: Record<string, unknown>): Record<string, unknown>[] | null {
  const entries = Object.entries(data);
  const isRow = (value: unknown) => isPlainObject(value) && Object.values(value).every(isScalar);
  if (entries.length < 2 || !entries.every(([, value]) => isRow(value))) return null;
  return entries.map(([key, value]) => ({ item: key, ...(value as Record<string, unknown>) }));
}

// Renders any report payload without knowing its shape: rows become a table,
// an object's plain values become stat tiles, and nested parts become sections.
export default function ReportData({ data, depth = 0 }: { data: unknown; depth?: number }) {
  if (data === null || data === undefined) return <Empty />;

  if (Array.isArray(data)) {
    if (data.length === 0) return <Empty />;
    if (data.every(isPlainObject)) return <DataTable rows={data} />;
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
    if (entries.length === 0) return <Empty />;

    const rowMap = asRowMap(data);
    if (rowMap) return <DataTable rows={rowMap} />;

    const scalars = entries.filter((entry): entry is [string, string | number | boolean | null] => isScalar(entry[1]));
    const nested = entries.filter(([, value]) => !isScalar(value));

    return (
      <div className="space-y-6">
        {scalars.length > 0 && <StatTiles entries={scalars} />}
        {nested.map(([key, value]) => (
          <section key={key} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{sentenceCase(key)}</h3>
            {depth < MAX_DEPTH ? (
              <ReportData data={value} depth={depth + 1} />
            ) : (
              <pre className="text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
            )}
          </section>
        ))}
      </div>
    );
  }

  return <StatTiles entries={[['value', data as string | number | boolean]]} />;
}
