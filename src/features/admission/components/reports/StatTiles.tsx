import { formatCell, sentenceCase, type Scalar } from '../../utils/reports';

// Headline numbers: a label over a value. Not a chart — one number per tile.
export default function StatTiles({ entries }: { entries: [string, Scalar][] }) {
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
