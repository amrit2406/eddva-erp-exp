import ObjectTable from './ObjectTable';
import { flattenRecord, formatValue, humanizeKey, isPrimitive } from '../../utils/format';
import type { GenericRecord } from '../../types/hostel.types';

interface GenericDataViewProps {
  data: GenericRecord | GenericRecord[];
  emptyMessage: string;
  // Links the first column of list rows to a detail page.
  rowHref?: (row: GenericRecord) => string | undefined;
}

// Shows a response of unknown shape: a list becomes a table, an object becomes
// stat tiles for its scalar fields plus a table for each list it contains.
export default function GenericDataView({ data, emptyMessage, rowHref }: GenericDataViewProps) {
  if (Array.isArray(data)) return <ObjectTable rows={data} emptyMessage={emptyMessage} rowHref={rowHref} />;

  const tiles = Object.entries(flattenRecord(data)).filter(([, value]) => isPrimitive(value) && value !== null);
  const tables = Object.entries(data).filter(
    (entry): entry is [string, GenericRecord[]] =>
      Array.isArray(entry[1]) && entry[1].length > 0 && typeof entry[1][0] === 'object'
  );

  if (tiles.length === 0 && tables.length === 0) {
    return <div className="p-8 text-center text-slate-500">{emptyMessage}</div>;
  }

  return (
    <div className="p-4 space-y-6">
      {tiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiles.map(([key, value]) => (
            <div key={key} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{humanizeKey(key)}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 break-words">{formatValue(key, value)}</p>
            </div>
          ))}
        </div>
      )}

      {tables.map(([key, rows]) => (
        <div key={key}>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">{humanizeKey(key)}</h3>
          <div className="rounded-lg border border-slate-200">
            <ObjectTable rows={rows} emptyMessage="No data" />
          </div>
        </div>
      ))}
    </div>
  );
}
